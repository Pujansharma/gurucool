const express = require('express');
const jwt=require("jsonwebtoken");
const bodyParser = require('body-parser');
const shortid = require('shortid');
const qrcode = require('qrcode');
const cors = require('cors');
const bcrypt=require("bcrypt")
const{userdata}=require("./model/user.model")
const {connection}=require("./connection")
const { Auth } = require("./authentication/Auth")
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const urlDatabase = {};

app.post('/shorten', (req, res) => {
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

app.get('/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;
  const longUrl = urlDatabase[`http://localhost:${PORT}/${shortUrl}`];

  if (longUrl) {
    res.redirect(longUrl);
  } else {
    res.status(404).send('Not Found');
  }
});

app.post("/register", async (req, res) => {
  try {
      const { firstname, lastname, email, password } = req.body;

      // Hash the user's password before saving it to the database
      const hashpass = await bcrypt.hash(password, 10);

      const user = new userdata({
          firstname,
          lastname,
          email,
          password: hashpass, // Store the hashed password in the database
      });

      await user.save();
      res.status(200).send("Register successful");
  } catch (error) {
      console.log(error);
      res.status(500).send(error);
  }
});


//login user
app.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await userdata.findOne({ email });
      if (!user) {
          res.status(401).send("Invaild credentails");
          return;
      }
      const passvaild = await bcrypt.compare(password, user.password);
      if (!passvaild) {
          res.status(401).send("Invaild credentails");
          return;
      }
      const token = jwt.sign({ userId: user._id }, "masai");
      res.json({ token })
  } catch (error) {
    console.error(error); // Log the specific error for debugging
    res.status(500).send("Error logging in");
}

})


app.listen(PORT, async() => {
  try {
    await connection;
    console.log("connected to datebase")
  } catch (error) {
    console.log("something went wrong")
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});
