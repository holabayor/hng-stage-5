require('dotenv').config();
const fs = require('fs');
const { execSync: exec } = require('child_process');
const { Deepgram } = require('@deepgram/sdk');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');

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
  try {
    // Check if the input file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('Input file does not exist');
    }

    // Check if the video file contains an audio track

    // Convert video to audio if necessary
    const audioFilePath = `${filePath}.wav`;
    if (!fs.existsSync(audioFilePath)) {
      ffmpeg(`-hide_banner -y -i ${filePath} ${audioFilePath}`);
    }

    // Check if the audio file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error('Audio file does not exist');
    }

    // Read the audio file and transcribe it
    const audioFile = {
      buffer: fs.readFileSync(audioFilePath),
      mimetype: 'audio/wav',
    };
    const response = await deepgram.transcription.preRecorded(audioFile, {
      punctuation: true,
    });

    // Check if transcription results are available
    if (
      response &&
      response.results &&
      response.results.channels &&
      response.results.channels.length > 0
    ) {
      const firstChannel = response.results.channels[0];
      if (
        firstChannel &&
        firstChannel.alternatives &&
        firstChannel.alternatives.length > 0
      ) {
        return firstChannel.alternatives[0].transcript;
      } else {
        throw new Error('No transcription alternatives available');
      }
    } else {
      throw new Error('Transcription response is invalid');
    }
  } catch (error) {
    return error.message;
  }
}

const videoPath = path.join(
  __dirname,
  '../uploads',
  '37974b40-cdc3-4fcf-bd3a-386abdcb8adc.webm'
);
transcribeVideo(videoPath).then((result) => {
  return result;
});

module.exports = transcribeVideo;
