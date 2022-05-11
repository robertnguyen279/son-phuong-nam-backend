import serverless from 'serverless-http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import connectToDatabase from 'services/mongoose.service';
import userRoutes from 'routes/user.route';
import productRoutes from 'routes/product.route';
import postRoutes from 'routes/post.route';
import siteInfoRoutes from 'routes/site.route';
import carouselRoutes from 'routes/carousel.route';
import { errorLogger, errorResponder, invalidPathHandler } from 'middlewares/error.middleware';
import { upload, handleUploadFile } from 'services/s3.service';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/post', postRoutes);
app.use('/site', siteInfoRoutes);
app.use('/carousel', carouselRoutes);
app.post('/upload', upload.single('file'), handleUploadFile);

app.use(invalidPathHandler);
app.use(errorLogger);
app.use(errorResponder);

export const handler = serverless(app, {
  async request(request, event, context) {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectToDatabase();
  }
});
