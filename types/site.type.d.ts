import { Document, Model } from 'mongoose';

export interface SiteInfo {
  phone: number;
  taxCode: number;
  address: string;
  email: string;
}

export type SiteInfoDocument = Document & SiteInfo;

export type SiteInfoModel = Model<SiteInfoDocument>;
