require('dotenv').config();
const express = require('express');

const app = express();

app.use('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to HelpMeOut' });
});

app.listen(process.env.PORT || 4000, () => {
  console.log('Server is now running');
});
