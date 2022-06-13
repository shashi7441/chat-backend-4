import nodemailer from 'nodemailer';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
const { users } = require('../../models/');
dotenv.config();
import * as jwt from 'jsonwebtoken';

import { Op } from 'sequelize';

const ngrokUrl = process.env.NGROKBASEURL
export const tokenVarify = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const secretKey: any = process.env.SECRET_KEY;
    const token: any = req.cookies.access_token;
    if (!token) {
    return res.render("login")
    } else {
      // const authHeader: any = req.headers.authorization;
      // const bearerToken: any = authHeader.split(" ");
      // let myToken: any = bearerToken[1];
      await jwt.verify(token, secretKey, async (error: any, payload: any) => {
        if (payload) { 
          req.id = payload.id;
          req.fullName = payload.fullName
          next();
        } else {
          return res.status(400).json({
            success: false,
            message: 'Invalid token',
            data: error.message,
          });
        }
      });
    }
  } catch (e: any) {
    return res.json({
      success: false,
      statusCode: 400,
      message: e.message,
    });
  }
};

export const sendMail = async (req: Request, res: Response, html: any) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MY_MAIL,
        pass: process.env.MY_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.MY_MAIL,
      to: req.body.email,
      subject: 'Verify your mail',
      html: html,
    };
    transporter.sendMail(mailOptions, function (error: any, info: any) {
      if (error) {
        throw new Error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export const userVerifiedEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const emailTrim = email.trim();
    const otpTrim = otp.trim();
    const otpNumber = Number(otpTrim);
    const findData = await users.findOne({
      where: {
        email: emailTrim,
      },
    });
    if (!findData) {
      return res.render('verifyemail', {
        msg: 'user not found',
      });
    }
    const finalResult = findData.dataValues.otp;
    const otpExpTime = findData.dataValues.otpExpTime;
    if (finalResult !== otpNumber) {
      return res.render('verifyemail', {
        msg: 'otp are not match',
      });
    }
    const values = findData.dataValues.isVerified;

    if (values === true) {

 const result = `${ngrokUrl}/api/auth/user/login`
 const data =   result.replace(/ /g,"" )
     return res.redirect(data);
    }

    if (otpExpTime < Date.now()) {
      return res.render('verifyemail', {
        msg: 'your otp will be expire',
      });
    }

    if (values === false) {
      await users.update(
        { isVerified: true },
        {
          where: {
            otp: otpNumber,
          },
        }
      );
   return res.render("login2",{msg:""} )
//       const result = `${ngrokUrl}/api/auth/user/login2`
//  const data =   result.replace(/ /g,"" )
//      return res.redirect(data);
    }
  } catch (e: any) {
    console.log(e);

    return res.json({
      success: false,
      statusCode: 400,
      message: e.message,
    });
  }
};

export const pageNotFound = async (_: Request, res: Response) => {
  try {
    res.render('404');
  } catch (e: any) {
    return res.json({
      statusCode: 500,
      message: e.message,
    });
  }
};

