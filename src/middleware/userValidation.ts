import joi from 'joi';

import { Request, Response, NextFunction } from 'express';

export const userLoginValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validateUser = (user: any) => {
    const JoiSchema = joi.object({
      email: joi
        .string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net'] },
        })
        .required(),
      password: joi.string().min(6).max(50).required(),
    });
    return JoiSchema.validate(user);
  };
  const response = validateUser(req.body);
  // console.log('ffdasfdasfaf', req.body);
  if (response.error) {


    const msg = response.error.details[0].message;
    console.log(msg);

    // return res
    //   .status(422)
    //   .json({ status: 422, message: msg.replace(/[^a-zA-Z ]/g, "") });
  } else {
    next();
  }
};

export const userSignupValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validateUser = (user: object) => {
    const JoiSchema = joi.object({
      email: joi
        .string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net'] },
        })
        .trim()
        .required(),
      password: joi.string().min(6).max(50).required().trim(),
      fullName: joi.string().min(0).max(20),
    });
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);

  if (response.error) {
    const msg = response.error.details[0].message;
    console.log(req.body);

    return res
      .status(422)
      .json({ status: 422, message: msg.replace(/[^a-zA-Z ]/g, '') });
  } else {
    next();
  }
};

export const userOtpValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validateUser = (user: object) => {
    const JoiSchema = joi.object({
      email: joi
        .string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net'] },
        })
        .trim()
        .required(),
      otp: joi.string().length(6).required(),
    });

    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);

  if (response.error) {
    const msg = response.error.details[0].message;
    return res
      .status(422)
      .json({ status: 422, message: msg.replace(/[^a-zA-Z ]/g, '') });
  } else {
    next();
  }
};
