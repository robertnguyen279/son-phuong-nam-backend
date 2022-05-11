import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface Product {
  name: string;
  noToneName: string;
  description: string;
  urlString: string;
  picture: string;
  category: ObjectId;
}

export interface ProductDocument extends Product, Document {
  _doc: ProductDocument;
}

export type ProductModel = Model<ProductDocument>;

export type FindProductArgs = {
  noToneName?: {
    $regex: string;
  };
  category?: string;
};
