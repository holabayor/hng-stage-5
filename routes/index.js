const fs = require('fs');
const upload = require('../utils');
const express = require('express');
const path = require('path');

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

router.post('/upload', upload.single('video'), (req, res) => {
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

module.exports = router;
