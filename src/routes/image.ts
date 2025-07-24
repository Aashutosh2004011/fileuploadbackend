import { Router } from 'express';
import { protect } from '../middleware/auth';
import { uploadImage } from '../utils/fileUpload';
import {
  uploadImage as uploadImageCtrl,
  getImages,
  searchImages,
  deleteImage,
} from '../controllers/image';

const router = Router();

router.use(protect);

router.route('/')
  .get(getImages)
  .post(uploadImage, uploadImageCtrl);

router.route('/search').get(searchImages);

router.route('/:id').delete(deleteImage);

export default router;