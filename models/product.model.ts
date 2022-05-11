import { Schema, model, models, Types } from 'mongoose';
import { ProductDocument, ProductModel } from 'types/product.type';
import { removeVietnameseTones, transformNameToUrl } from 'services/common.service';

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    noToneName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    urlString: {
      type: String,
      required: true,
      unique: true
    },
    category: {
      type: Types.ObjectId,
      required: true,
      ref: 'Category'
    },
    picture: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

productSchema.pre('validate', function (next): void {
  this.noToneName = removeVietnameseTones(this.name);
  if (!this.urlString) {
    this.urlString = transformNameToUrl(this.noToneName);
  }

  next();
});

const Product = (models.Product as ProductModel) || model<ProductDocument, ProductModel>('Product', productSchema);

export default Product;
