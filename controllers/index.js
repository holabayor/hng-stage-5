const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import the uuid library
const transcribeVideo = require('../utils/transcribe');

let videoId;
let uploadedChunks = [];

const startVideo = async (req, res) => {
  try {
    videoId = uuidv4(); // Generate a new video ID

    res.status(200).json({ message: 'Recording starts', videoId: videoId });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const uploadChunk = async (req, res) => {
  try {
    const chunk = req.file.buffer;
    // console.log('The uploaded chunk is', chunk);
    await uploadedChunks.push(chunk);

    // console('The uploaded chunks is of length', uploadedChunks.length);

    res.status(200).send('Chunk received');
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid file',
    });
  }
};

const stopVideo = async (req, res) => {
  try {
    videoId = req.body.videoId;
    if (uploadedChunks.length === 0 || !videoId) {
      return res.status(400).json({
        success: false,
        message: 'No chunks received or video not started',
      });
    }

    const allChunks = Buffer.concat(uploadedChunks);

    const uploadDir = path.join(__dirname, '../uploads');

    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const videoPath = path.join(uploadDir, `${videoId}.webm`);
    await fs.promises.writeFile(videoPath, allChunks);

    const transcription = await transcribeVideo(videoPath);
    const subtitlePath = path.join(uploadDir, `${videoId}.srt`);
    await fs.promises.writeFile(subtitlePath, transcription);

    // Return the transcription result along with the path to the subtitle file
    res.status(200).json({
      success: true,
      videoId: videoId,
      videopath: videoPath,
      transcription: transcription,
      subtitlePath: subtitlePath,
    });
  } catch (error) {
    console.log('The error is', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    if (!videoId) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    const videoPath = path.join(__dirname, '../uploads', `${videoId}.webm`);
    const videoSize = fs.statSync(videoPath).size;

    const headers = {
      'Content-Length': videoSize,
      'Content-Type': 'video/webm',
    };

    const videoStream = fs.createReadStream(videoPath);

    videoStream.pipe(res);

    // Send video details as JSON once the video stream is finished
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = { startVideo, uploadChunk, stopVideo, getVideo };
