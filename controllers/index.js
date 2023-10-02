const fs = require('fs');
const upload = require('../utils');
const path = require('path');

class UploadController {
  static async uploadChunk(req, res) {
    const videoId = req.body.uuid;
    // console.log(`Chunk received for UUID: ${videoId}`);

    if (!recordings.has(videoId)) {
      return res.status(400).json({ error: 'Invalid UUID' });
    }

    const chunk = req.file.buffer;
    recordings.get(videoId).push(chunk);

    res.status(200).send('Chunk received');
  }

  static async uploadVideo(req, res) {
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
  }
}

module.exports = { uploadChunk: UploadController.uploadChunk };
