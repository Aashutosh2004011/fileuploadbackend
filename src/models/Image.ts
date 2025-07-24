import mongoose, { Document } from 'mongoose';

export interface IImage extends Document {
  name: string;
  user: mongoose.Schema.Types.ObjectId;
  folder: mongoose.Schema.Types.ObjectId | null;
  imageUrl: string;
  createdAt: Date;
}

const ImageSchema = new mongoose.Schema<IImage>({
  name: {
    type: String,
    required: [true, 'Please add an image name'],
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ImageSchema.index({ name: 'text' });

export default mongoose.model<IImage>('Image', ImageSchema);