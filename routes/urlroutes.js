const shortid = require('shortid');
const qrcode = require('qrcode');
const express = require('express');
const Urlrouter=express.Router()
const urlDatabase = {};

Urlrouter.post('/shorten', (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'Long URL is required' });
  }

  const shortUrl = `http://localhost:${PORT}/${shortid.generate()}`;
  const qrCodeData = qrcode.toDataURL(shortUrl);
  // urlDatabase[shortUrl] = longUrl;
  urlDatabase[shortUrl] = {
    longUrl,
    qrCodeData,
  };
  
  // res.json({ shortUrl });
  res.json({
    shortUrl,
    qrCodeData,
  });
  // res.json({ shortUrl });
});

Urlrouter.get('/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;
  const longUrl = urlDatabase[`http://localhost:${PORT}/${shortUrl}`];

  if (longUrl) {
    res.redirect(longUrl);
  } else {
    res.status(404).send('Not Found');
  }
});

module.exports={
    Urlrouter
}