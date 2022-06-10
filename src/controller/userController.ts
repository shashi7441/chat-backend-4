import { Request, Response, NextFunction } from 'express';
const { users, conversation } = require('../../models');
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { ApiError } from '../services/error';
import { Op } from 'sequelize';
import { html, createOtp } from '../services/otpMailTemplate';
import { searchFriendForFrontend, sendMail } from '../services/userService';
import { v4 as uuid } from 'uuid';

dotenv.config();

const ngrokUrl = process.env.NGROKBASEURL

const friendRequestCount = async (userId: any) => {
  console.log("<<", userId);
  
  const userData = await conversation.findAll({
    where: {
      recieverId: userId,
      state: 'pending',
    },
    attributes: ['senderId'],
    include: [
      {
        model: users,
        attributes: ['email', 'fullName', 'id'],
        as: 'sender',
      },
    ],
  });
  return userData;
};

export const getAllUser = async (userId: any) => {
  let myobj;
  const conversationData = await conversation.findAll({
    where: {
      [Op.or]: [
        {
          senderId: userId,
        },
        {
          recieverId: userId,
        },
      ],
      state: ['accepted'],
    },
  });

  if (conversationData.length <= 0) {
    console.log('00000');
    myobj = {
      userData: [],
      conversationId: null,
    };
    return myobj;
  }
  const otherIds: any = [];
  if (conversationData.length > 0) {
    conversationData.map((element) => {
      if (element.senderId === userId) {
        otherIds.push(element.recieverId);
      } else {
        otherIds.push(element.senderId);
      }
    });

    const userData = await users.findAll({
      where: {
        id: otherIds,
      },
    });
    myobj = {
      userData: userData,
    };

    return myobj;
  }
  return true;
};

export const signup = async (req: Request, res: any, next: NextFunction) => {
  try {
    const myId = uuid();
    const secretKey: any = process.env.SECRET_KEY;
    const otpExp = new Date(new Date().getTime() + 5 * 60000);
    const { email, password }: { email: string; password: string } = req.body;
    const emailTrim = email.trim();
    const passwordTrim = password.trim();
    const salt: any = await bcrypt.genSalt(10);
    const hash: string = await bcrypt.hash(passwordTrim, salt);
    const findData = await users.findOne({
      where: {
        email: emailTrim,
      },
    });

    if (!findData) {
      const { fullName }: { fullName: string } = req.body;
      if (!fullName) {
        return res.render('login', { msg: 'fullName is required', url:"" });
      }
      if (fullName.length < 3) {
        return res.render('login', { msg: 'charcter lenght should be 3', url:"" });
      }
      const fullNameTrim: string = fullName.trim();

      let realOtp = createOtp();
      await users.create({
        fullName: fullNameTrim,
        email: emailTrim,
        password: hash,
        id: myId,
      });
      const findCreateData = await users.findOne({
        where: { email: emailTrim },
      });
      await users.update(
        { otp: realOtp, otpExpTime: otpExp },
        {
          where: {
            email: emailTrim,
          },
        }
      );
      await sendMail(req, res, html(realOtp));
      const databasePassword = findCreateData.dataValues.password;
      const passwordMatch = await bcrypt.compare(
        passwordTrim,
        databasePassword
      );
      const values = findCreateData.dataValues.isVerified;
      if (!passwordMatch) {
        return res.render('login', { msg: 'invalid credential', url:"" });
      }
      if (values === false) {
        return res.render('verifyemail', {
          msg: 'otp will be send on email',
        });
      }
    } else {
      const loginPassword = findData.dataValues.password;
      const loginId = findData.dataValues.id;
      const verified = findData.dataValues.isVerified;
      const passwordMatch = await bcrypt.compare(passwordTrim, loginPassword);
      let realOtp = createOtp();
      const originalData = await users.findOne({
        where: {
          email: emailTrim,
        },
      });
      const checkVerify = originalData.isVerified;
      if (checkVerify === false) {
        await sendMail(req, res, html(realOtp));

        await users.update(
          { otp: realOtp, otpExpTime: otpExp },
          {
            where: {
              email: emailTrim,
            },
          }
        );
      }
      if (!passwordMatch) {
        return res.render('login', { msg: 'invalid credential', url:"" });
        // return next(new ApiError("Invalid credential", 400));
      }
      if (verified === false) {
        const result = `${ngrokUrl}/api/verifyEmail`
        const data =   result.replace(/ /g,"" )

        return res.render('verifyemail', {
          msg: 'otp will be send on email',
          urt:data
        });
      }
      if (verified === true) {
        if (passwordMatch) {
          const jwtToken = jwt.sign({ id: loginId }, secretKey, {
            expiresIn: '1d',
          });
          res.cookie('access_token', `${jwtToken}`, {
            expires: new Date(Date.now() + 9999999),
            httpOnly: false,
          });
        }
        
    const result = `${ngrokUrl}/api/auth/user/searchFriend`
    const data =   result.replace(/ /g,"" )
        return res.redirect(data);
      
      }

    }
  } catch (e: any) {
    console.log(e);

    return next(new ApiError(e.message, 400));
  }
  return true;
};

export const searchFriend = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {


    const search: any = req.query.search;
// console.log(req.rawHeaders);
 

    if (!search) {
      const userId = req.id;
      const loginId = req.id;
      const { userData } = await getAllUser(userId);
      const userList = await searchFriendForFrontend(req, res, userId);
      const friendRequests = await friendRequestCount(userId);
      res.render('test', {
        data: userData,
        userId: loginId,
        conversationId: '',
        chatWith: '',
        showmessages: [],
        sendMessage: '',
        userList: userList,
        recieverId: '',
        friendRequest: '',
        seeRequest: friendRequests,
      });
    }

    if (search) {
      const originalSearch = search.replace(/[' "]+/g, '');
      const user = await users.findAll(
        {
          where: {
            id: {
              [Op.ne]: [req.id],
            },

            fullName: {
              [Op.iRegexp]: `${originalSearch}`,
            },
            isVerified: true,
          },
        },
        { attributes: ['email', 'fullName', 'id'] }
      );
      return user;
    }
  } catch (e: any) {
    return next(new ApiError(e.message, 400));
  }
  return true;
};


export const logOut = (req:Request, res:Response)=>{
  try{
    const result = `${ngrokUrl}/api/auth/user/login`
    const data =   result.replace(/ /g,"" )
 return  res.clearCookie("access_token").redirect(data)


  }catch(e:any){
    return res.json({
      statusCode:400,
      msg:e.msg
    })
  }
}

