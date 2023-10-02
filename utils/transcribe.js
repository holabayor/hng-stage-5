require('dotenv').config();
const fs = require('fs');
const { execSync: exec } = require('child_process');
const { Deepgram } = require('@deepgram/sdk');
const ffmpegStatic = require('ffmpeg-static');

const deepgram = new Deepgram(process.env.API_KEY);

async function ffmpeg(command) {
  return new Promise((resolve, reject) => {
    exec(`${ffmpegStatic} ${command}`, (err, stderr, stdout) => {
      if (err) reject(err);
      resolve(stdout);
    });
  });
}

async function transcribeVideo(filePath) {
  ffmpeg(`-hide_banner -y -i ${filePath} ${filePath}.wav`);

  const audioFile = {
    buffer: fs.readFileSync(`${filePath}.wav`),
    mimetype: 'audio/wav',
  };
  const response = await deepgram.transcription.preRecorded(audioFile, {
    punctuation: true,
  });
  return response.results.channels[0].alternatives[0].transcript;
}

transcribeVideo(videoPath)
  .then((transcriptionResult) => {
    return transcriptionResult;
  })
  .catch((error) => {
    console.error('Error:', error);
  });

module.exports = transcribeVideo;
