require('dotenv').config();
const express = require('express');
const cors = require('cors');

const router = require('./routes');

const app = express();
app.use(cors());

app.use('/api', router);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('Server is now running on PORT', PORT);
});
