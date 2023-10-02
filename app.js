const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Import the uuid library

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

const recordings = new Map();

app.post('/start-recording', (req, res) => {
  // Generate a UUID for a new video recording
  const videoId = uuidv4();
  console.log(`Recording starts with UUID: ${videoId}`);

  // Create an entry in the recordings map
  recordings.set(videoId, []);

  // Send the UUID in the response
  res.status(200).json({ message: 'Recording starts', videoId: videoId });
});

app.post('/upload-chunk', upload.single('videoChunk'), (req, res) => {
  const videoId = req.body.videoId;
  console.log(`Chunk received for UUID: ${videoId}`);

  if (!recordings.has(videoId)) {
    return res.status(400).json({ error: 'Invalid UUID' });
  }

  // Handle the uploaded video chunk
  const chunk = req.file.buffer;

  // Append the chunk to the recording data
  recordings.get(videoId).push(chunk);

  console.log('Saved the received chunk');
  res.status(200).json({ message: 'Chunk received' });
});

app.post('/stop-recording', (req, res) => {
  console.log('The request is', req);
  const videoId = req.body.videoId;
  console.log(`Recording stops for UUID: ${videoId}`);

  if (!recordings.has(videoId)) {
    return res.status(400).json({ error: 'Invalid UUID' });
  }

  // Handle the end of recording

  const recordingChunks = recordings.get(videoId);

  // Concatenate the chunks into a single buffer
  const concatenatedBuffer = Buffer.concat(recordingChunks);

  // Save the recording using the UUID as the filename
  const recordingFilePath = path.join(uploadDir, `${videoId}.webm`);
  fs.writeFileSync(recordingFilePath, concatenatedBuffer);

  // Remove the entry from the recordings map
  recordings.delete(videoId);

  res.status(200).json({ message: 'Recording stopped' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
