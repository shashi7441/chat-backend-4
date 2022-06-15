import express from 'express';
export const app = express();
import dotenv from 'dotenv';
dotenv.config();
import { googleRoutes } from './router/googleRoutes';
import { friendRequestRoutes } from './router/friendRequestRouter';
import { messageRoutes } from './router/messageRouter';
import { error } from './services/error';
import { pageNotFound } from './services/userService';
import cookieParser from 'cookie-parser';
import '../src/socketClient';
import path from 'path';
import userRoutes from './router';
import './controller/passport';
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/auth/user', userRoutes);
app.use('/', googleRoutes);

app.use('/api', friendRequestRoutes);
app.use('/api', messageRoutes);
app.use(express.static(__dirname + '/views/pages'));
app.use(express.static(__dirname + '/views/image'));
app.use(express.static(__dirname + '/views/css'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/pages'));

app.get('/failed', (req, res) => {
  return res.json({
    statusCode: 400,
    message: 'Invalid credential',
  });
});

app.use('/*', pageNotFound);

app.use(error);
