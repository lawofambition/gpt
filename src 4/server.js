const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@notionhq/client');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(express.static('public'));

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getNotionBlocks(pageId) {
  const blocks = await notion.blocks.children.list({ block_id: pageId });
  return blocks.results;
}

async function processWithGPT(prompt, content) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: content }
    ]
  });
  return response.choices[0].message.content;
}

async function updateNotionBlock(blockId, newText) {
  await notion.blocks.update({
    block_id: blockId,
    paragraph: { rich_text: [{ type: 'text', text: { content: newText } }] }
  });
}

app.post('/edit-notion', async (req, res) => {
  const { pageId, prompt } = req.body;
  try {
    const blocks = await getNotionBlocks(pageId);

    for (const block of blocks) {
      if (block.type === 'paragraph') {
        const text = block.paragraph.rich_text.map(rt => rt.plain_text).join('');
        const newText = await processWithGPT(prompt, text);
        await updateNotionBlock(block.id, newText);
      }
    }
    res.status(200).json({ message: 'Page updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to edit Notion content.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});