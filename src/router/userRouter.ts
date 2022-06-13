import expres from 'express';
import {
  userSignupValidation,
  userOtpValidation,
} from '../middleware/userValidation';
import { Response, Request } from 'express';
import { signup, searchFriend , logOut  , searchFriendForSpecificUser} from '../controller/userController';
import { userVerifiedEmail, tokenVarify } from '../services/userService';
export let userRoutes = expres.Router();

userRoutes.post('/signup', userSignupValidation, signup);

userRoutes.get('/login', (req:Request, res: Response) => {  
  res.render('login', {
    msg: ' ',
  });
  return true;
});

userRoutes.post('/verifyEmail', userOtpValidation, userVerifiedEmail);
userRoutes.get('/email', (_, res: Response) => {
  res.render('verifyemail');
  return true;
});

userRoutes.get('/searchFriend', tokenVarify, searchFriend);

userRoutes.get("/searchFriendForSpecificUser", tokenVarify, searchFriendForSpecificUser)

userRoutes.get("/logOut", logOut)