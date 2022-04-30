import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export enum Size {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL'
}

export interface Product {
  name: string;
  noToneName: string;
  description: string;
  urlString: string;
  discount: number;
  pictures: Array<string>;
  price: number;
  sold: number;
  category: ObjectId;
  available: Array<ObjectId>;
}

export interface ProductDocument extends Product, Document {
  totalQuantity: number;
  actualPrice: number;
  _doc: ProductDocument;
}

export type ProductModel = Model<ProductDocument>;

export type FindProductArgs = {
  noToneName?: {
    $regex: string;
  };
  category?: string;
};
