const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'RentifyImages', // folder in Cloudinary
    allowed_formats: ['jpeg', 'png', 'jpg', 'avif'],
  },
});

module.exports = {
  cloudinary,
  storage,
};
