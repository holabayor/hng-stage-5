const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// Set up storage for uploaded video chunks
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Directory to save the video chunks
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.post('/start-recording', (req, res) => {
  console.log('Recording starts');
  // Handle the start of recording
  // You can perform any setup or validation here
  res.status(200).send('Recording started');
});

app.post('/upload-chunk', upload.single('videoChunk'), (req, res) => {
  console.log('Chunk received', req.file.buffer);
  // Handle the uploaded video chunk
  const chunk = req.file.buffer;
  const chunkFileName = `${Date.now()}.webm`;
  const chunkFilePath = path.join(uploadDir, chunkFileName);

  fs.writeFileSync(chunkFilePath, chunk);

  // Respond with an acknowledgment
  console.log('Saved the received chunk');
  res.status(200).send('Chunk received');
});

app.post('/stop-recording', (req, res) => {
  console.log('Recording stops');
  // Handle the end of recording
  // You can finalize processing here
  res.status(200).send('Recording stopped');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
