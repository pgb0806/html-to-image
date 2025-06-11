const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json({ limit: '2mb' }));

app.post('/screenshot', async (req, res) => {
  const { html, width = 1200, height = 630 } = req.body;

  if (!html) {
    return res.status(400).send('Missing "html" field in request body.');
  }

  try {
    // ✅ This is where you configure Puppeteer for Render
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // ← Add this!
    });

    const page = await browser.newPage();
    await page.setViewport({ width: parseInt(width), height: parseInt(height) });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const screenshotBuffer = await page.screenshot({ type: 'png' });
    await browser.close();

    res.set('Content-Type', 'image/png');
    res.send(screenshotBuffer);
  } catch (err) {
    console.error('Screenshot failed:', err);
    res.status(500).send('Failed to generate screenshot');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`HTML to Image API running on port ${port}`);
});
