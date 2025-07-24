import mongoose, { Document } from 'mongoose';

export interface IFolder extends Document {
  name: string;
  user: mongoose.Schema.Types.ObjectId;
  parentFolder: mongoose.Schema.Types.ObjectId | null;
  path: string[];
  createdAt: Date;
}

const FolderSchema = new mongoose.Schema<IFolder>({
  name: {
    type: String,
    required: [true, 'Please add a folder name'],
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  path: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IFolder>('Folder', FolderSchema);