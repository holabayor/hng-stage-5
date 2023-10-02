const fs = require('fs');
const multer = require('multer');
const express = require('express');
const path = require('path');
const {
  startVideo,
  uploadChunk,
  stopVideo,
  getVideo,
} = require('../controllers');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/start-recording', startVideo);
router.post('/upload-chunk', upload.single('videoChunk'), uploadChunk);
router.post('/stop-recording', stopVideo);
router.get('/videos/:id', getVideo);

module.exports = router;
