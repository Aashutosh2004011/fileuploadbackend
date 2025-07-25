import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getFolders,
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderTree,
} from '../controllers/folder.js';

const router = Router();

router.use(protect);

router.route('/tree').get(getFolderTree);

router.route('/')
  .get(getFolders)
  .post(createFolder);

router.route('/:id')
  .get(getFolder)
  .put(updateFolder)
  .delete(deleteFolder);

export default router;