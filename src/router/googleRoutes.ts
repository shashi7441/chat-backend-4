import express from 'express';
export let googleRoutes = express.Router();
import passport from 'passport';
const { users } = require('../../models/');
import jwt from 'jsonwebtoken';
import { v4 as uuid, validate } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();
const secretKey: any = process.env.SECRET_KEY;

googleRoutes.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

googleRoutes.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/failed' }),
  async (req: any, res: any) => {
    const myId = uuid();
    const value = req.user.email;
    const fullName = req.user._json.name;

    const findData = await users.findOne({
      where: {
        email: value,
      },
    });
    if (!findData) {
      const createData = await users.create({
        email: value,
        id: myId,
        fullName: fullName,
        password: null,
      });
      const userId = createData.dataValues.id;
      const jwtToken = await jwt.sign({ id: userId }, secretKey, {
        expiresIn: '24h',
      });
      req.token = jwtToken;
      return res.json({
        statusCode: 400,
        message: 'login successfully',
        data: jwtToken,
      });
    } else {
      let myId = findData.dataValues.id;
      const jwtToken = await jwt.sign({ id: myId }, secretKey, {
        expiresIn: '24h',
      });
      req.token = jwtToken;
      return res.json({
        statusCode: 400,
        message: 'login successfully',
        data: jwtToken,
      });
    }
  }
);
