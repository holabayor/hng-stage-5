const fs = require('fs');
const upload = require('../utils');
const express = require('express');
const path = require('path');
const uploadChunk = require('../controllers');

const router = express.Router();

// Get a video
router.get('/video/:filename', (req, res) => {
  const { filename } = req.params;
  const videoPath = path.join(__dirname, '../videos', filename);
  console.log('Video path is ', videoPath);

  if (fs.existsSync(videoPath)) {
    const videoStream = fs.createReadStream(videoPath);
    res.setHeader('Content-Type', 'video/mp4'); // Adjust the content type as needed
    videoStream.pipe(res);
  } else {
    res.status(404).json({ message: 'Video not found' });
  }
});

router.get('/videos', (req, res) => {
  console.log('Query is ', req.query);
  const userId = req.query.userId || '';
  try {
    const videoDirectory = path.join(__dirname, '../videos', userId); // Adjust the path as needed

    console.log('Video Directory is ', videoDirectory);

    fs.readdir(videoDirectory, (err, files) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }

      // Filter out only video files (e.g., .mp4, .webm)
      const videoFiles = files.filter((file) => {
        const fileExtension = path.extname(file).toLowerCase();
        return ['.mp4', '.mkv', '.3gp', '.webm', 'avi', 'mpeg'].includes(
          fileExtension
        );
      });

      // Send the list of video files in the response
      res.status(200).json({
        success: true,
        message: 'Videos retrieved successfully',
        videos: videoFiles,
      });
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/upload-video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video',
      });
    }

    // const fileStream = fs.createReadStream(req.file.path);
    // res.setHeader('Content-Type', req.file.mimetype);
    // fileStream.pipe(res);
    console.log(req.file);
    res.json({
      message: 'Video uploaded successfully',
      url: req.file.path,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

router.post('/upload', upload.array('chunks'), (req, res) => {
  try {
    // req.files contains the uploaded chunks as buffers.
    const uploadedChunks = req.files;

    // Implement logic to store or process these chunks.
    // You may save them to a temporary directory, a database, or memory.

    // Example: Save the chunks to a temporary directory.
    const fs = require('fs');
    const path = require('path');
    const tempDir = path.join(__dirname, 'temp_chunks');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    uploadedChunks.forEach((chunk, index) => {
      const chunkFileName = `chunk${index}.webm`;
      const chunkFilePath = path.join(tempDir, chunkFileName);
      fs.writeFileSync(chunkFilePath, chunk.buffer);
    });

    cloudinary.uploader.upload(
      'video-file.mp4',
      { resource_type: 'video' },
      function (error, result) {
        if (error) {
          console.error(error);
        } else {
          console.log(result);
        }
      }
    );
    // Send a success response.
    res.status(200).json({ message: 'Video chunks uploaded successfully.' });
  } catch (error) {
    console.error('Error during chunk upload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/upload', upload.array('chunks'), (req, res) => {
  try {
    // req.files contains the uploaded chunks as buffers.
    const uploadedChunks = req.files;

    // Implement logic to store or process these chunks.
    // You may save them to a temporary directory, a database, or memory.

    // Example: Save the chunks to a temporary directory.
    const fs = require('fs');
    const path = require('path');
    const tempDir = path.join(__dirname, 'temp_chunks');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    uploadedChunks.forEach((chunk, index) => {
      const chunkFileName = `chunk${index}.webm`;
      const chunkFilePath = path.join(tempDir, chunkFileName);
      fs.writeFileSync(chunkFilePath, chunk.buffer);
    });

    // Send a success response.
    res.status(200).json({ message: 'Video chunks uploaded successfully.' });
  } catch (error) {
    console.error('Error during chunk upload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/start-recording', (req, res) => {
  // Generate a UUID for a new video recording
  const videoId = uuidv4();
  console.log(`Recording starts with UUID: ${videoId}`);

  // Create an entry in the recordings map
  recordings.set(videoId, []);

  // Send the UUID in the response
  res.status(200).json({ message: 'Recording starts', videoId: videoId });
});

router.post('/upload-chunk', upload.single('videoChunk'), (req, res) => {
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

router.post('/stop-recording', (req, res) => {
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

module.exports = router;
