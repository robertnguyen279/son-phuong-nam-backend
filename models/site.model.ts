import { Schema, model, models } from 'mongoose';
import validator from 'validator';
import { SiteInfoDocument, SiteInfoModel } from 'types/site.type';

const siteSchema = new Schema(
  {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: (email: string) => {
          return validator.isEmail(email);
        },
        message: 'Email is invalid'
      }
    },
    address: {
      type: String,
      required: true
    },
    taxCode: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const SiteInfo = (models.SiteInfo as SiteInfoModel) || model<SiteInfoDocument, SiteInfoModel>('SiteInfo', siteSchema);

export default SiteInfo;
