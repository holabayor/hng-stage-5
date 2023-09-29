const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set maximum file size to 100MB
const maxSize = 100 * 1024 * 1024;

// Set up storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.body.userId || req.query.userId || '';
    const userDir = path.join(__dirname, '../videos', userId);
    console.log(userDir);

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const fileName = `${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: localStorage,
  limits: { fileSize: maxSize },
  // fileFilter: (req, file, cb) => {
  //   const filetypes = /mp4|avi|ogg|webm/;
  //   const mimetype = filetypes.test(file.mimetype);
  //   const extname = filetypes.test(
  //     path.extname(file.originalname).toLowerCase()
  //   );
  //   if (mimetype && extname) {
  //     return cb(null, true);
  //   }
  //   cb(
  //     `Error: File upload only supports the following filetypes - ${filetypes}`
  //   );
  // },
});

module.exports = upload;
