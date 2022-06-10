const { conversation, users } = require('../../models/');
import { Op } from 'sequelize';
import { Response, NextFunction } from 'express';
import { ApiError } from '../services/error';
import { v4 as uuid, validate } from 'uuid';
import io from '../socketClient';
export const sendFriendRequest = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    
    
    const myId = uuid();
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, '');
    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError('please put valid id ', 400));
    }
    // console.log(numberId);
    // console.log(req.id);
    
    const recieverData: any = await users.findOne({
      where: {
        id: req.id,
      },
    });

    if (numberId === req.id) {
      res.render('test', {
        data: [],
        userId: req.id,
        conversationId: '',
        chatWith: '',
        seeRequest: '',
        showmessages: [],
        sendMessage: '',
        userList: [],
        recieverId: numberId,
        friendRequest: 'you can not send request',
      });
    }

    if (!recieverData) {
      res.render('test', {
        data: [],
        userId: req.id,
        conversationId: '',
        chatWith: '',
        seeRequest: '',
        showmessages: [],
        sendMessage: '',
        userList: [],
        recieverId: numberId,
        friendRequest: 'no user found',
      });
    }

    const cheackFriendRequest = await conversation.findOne({
      where: {
        senderId: { [Op.or]: [req.id, numberId] },
        recieverId: { [Op.or]: [req.id, numberId] },
      },
    });
    if (cheackFriendRequest) {
      const senderId = cheackFriendRequest.dataValues.senderId;
      const status = cheackFriendRequest.dataValues.state;
      if (status === 'blocked') {
        res.render('test', {
          data: [],
          userId: req.id,
          conversationId: '',
          chatWith: '',
          seeRequest: '',
          showmessages: [],
          sendMessage: '',
          userList: [],
          recieverId: numberId,
          friendRequest: 'you can not send request',
        });
      }
      if (status === 'accepted') {
        res.render('test', {
          data: [],
          userId: req.id,
          conversationId: '',
          chatWith: '',
          seeRequest: '',
          showmessages: [],
          sendMessage: '',
          userList: [],
          recieverId: numberId,
          friendRequest: 'you are already friend',
        });
      }
      if (status === 'pending' && senderId === numberId) {
        res.render('test', {
          data: [],
          userId: req.id,
          conversationId: '',
          chatWith: '',
          seeRequest: '',
          showmessages: [],
          sendMessage: '',
          userList: [],
          recieverId: numberId,
          friendRequest: 'you have already request',
        });
      }
      if (status === 'pending') {
        res.render('test', {
          data: [],
          userId: req.id,
          conversationId: '',
          chatWith: '',
          seeRequest: '',
          showmessages: [],
          sendMessage: '',
          userList: [],
          recieverId: numberId,
          friendRequest: 'already send request',
        });
      }
      1;
      if (status === 'unfriend') {
        res.render('test', {
          data: [],
          userId: req.id,
          conversationId: '',
          chatWith: '',
          seeRequest: '',
          showmessages: [],
          sendMessage: '',
          userList: [],
          recieverId: numberId,
          friendRequest: 'you are unfriend',
        });
      }
    }
    if (!cheackFriendRequest) {
      await conversation.create({
        senderId: req.id,
        recieverId: numberId,
        id: myId,
      });

      io.emit('sendRequest', {
        senderId: req.id,
        recieverId: numberId,
      });

      await conversation.findAll({
        where: {
          recieverId: id,
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

      return res.render('test', {
        data: [],
        userId: req.id,
        conversationId: '',
        chatWith: '',
        seeRequest: '',
        showmessages: [],
        sendMessage: '',
        userList: [],
        recieverId: numberId,
        friendRequest: 'friend request is send',
      });
    }
  } catch (e: any) {
    console.log('eeeeeeeeee', e);

    return next(new ApiError(e.message, 400));
  }
};

export const friendRequestAccept = async (
  req: any,
  _: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, '');

    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError('please put valid id ', 400));
    }
    if (req.id === numberId) {
      return next(new ApiError('can not accept request', 404));
    }

    const recieverData: any = await users.findOne({
      where: {
        id: numberId,
      },
    });
    if (!recieverData) {
      return next(new ApiError('no user found', 404));
    }
    const cheackFriendRequest = await conversation.findOne({
      where: {
        senderId: { [Op.or]: [req.id, numberId] },
        recieverId: { [Op.or]: [req.id, numberId] },
      },
    });

    if (!cheackFriendRequest) {
      return next(new ApiError('no conversation found', 400));
    }
    if (cheackFriendRequest) {
      const recieverId = cheackFriendRequest.dataValues.recieverId;
      const match = req.id === recieverId;
      const value = cheackFriendRequest.dataValues.state;

      if (value === 'pending' && match == false) {
        return next(new ApiError('sender can not accept request', 400));
      }

      if (value === 'accepted' && match === true) {
        return next(new ApiError('already accepted ', 400));
      }

      if (value === 'pending' && match === true) {
        const updateData = await conversation.update(
          { state: 'accepted' },
          {
            where: {
              // senderId: parseInt(numberId),
              recieverId: req.id,
            },
          }
        );

        io.emit('acceptRequest', {
          recieverId: updateData.recieverId,
          senderId: updateData.senderId,
          message: 'friend request is accepted you are not friend',
        });

        return next(
          new ApiError('friend request is  accepted, you are now friend ', 200)
        );
      }
    }
  } catch (e: any) {
    console.log(e);

    return next(new ApiError(e.message, 400));
  }
};

export const friendRequestReject = async (
  req: any,
  _: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, '');

    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError('please put valid id ', 400));
    }
    if (req.id === numberId) {
      return next(new ApiError('can not reject request ', 404));
    }

    const cheackFriendRequest = await conversation.findOne({
      where: {
        senderId: { [Op.or]: [req.id, numberId] },
        recieverId: { [Op.or]: [req.id, numberId] },
        state: 'pending',
      },
    });

    if (!cheackFriendRequest) {
      return next(new ApiError('no conversation found', 400));
    }

    if (cheackFriendRequest) {
      const recieverId = cheackFriendRequest.dataValues.recieverId;
      const match = req.id === recieverId;
      const value = cheackFriendRequest.dataValues.state;

      if (value === 'pending' && match === false) {
        return next(new ApiError('sender can not reject request', 400));
      }
      if (value === 'pending' && match == true) {
        await conversation.destroy({
          where: {
            recieverId: req.id,
            senderId: numberId,
          },
        });

        return next(new ApiError('friend request is  reject ', 200));
      }
    }
  } catch (e: any) {
    return next(new ApiError(e.message, 400));
  }
};

export const seeFriendRequest = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.id;
    const userData = await conversation.findAll({
      where: {
        recieverId: id,
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

    if (userData.length == 0) {
      return res.render('friendRequest', {
        userData: [],
        userId: id,
        message: 'no  friend  request is found',
      });
    }

    return res.render('friendRequest', {
      userData: userData,
      userId: id,
      message: '',
    });
  } catch (e: any) {
    return next(new ApiError(e, 404));
  }
};

export const seeSenderRequest = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.id;

    const userData = await conversation.findAll({
      where: {
        senderId: id,
        isAccepted: false,
      },
      attributes: ['senderId'],
      include: [
        {
          model: users,
          attributes: ['email', 'fullName', 'id'],
          as: 'reciever',
        },
      ],
    });

    if (userData.length == 0) {
      return next(new ApiError('no  friend  request is found', 204));
    }

    return res.json({
      statusCode: 200,
      data: userData,
    });
  } catch (e: any) {
    return next(new ApiError(e, 404));
  }
};

export const blockMessage = async (req: any, res: Response) => {
  try {
    const myId = uuid();
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, '');
    const checkId = validate(numberId);
    if (checkId === false) {
      return res.json({
        statusCode: 400,
        message: 'please put valid id',
      });
    }
    const conversationData = await conversation.findOne({
      where: {
        senderId: {
          [Op.or]: [req.id, numberId],
        },
        recieverId: {
          [Op.or]: [req.id, numberId],
        },
      },
    });
    if (!conversationData) {
      await conversation.create({
        id: myId,
        senderId: req.id,
        recieverId: numberId,
        state: 'blocked',
      });

      return res.json({
        statusCode: 200,
        message: 'user blocked successfully',
      });
    }
    if (conversationData) {
      const value = conversationData.dataValues.state;
      if (value === 'blocked') {
        await conversationData.update(
          { state: 'accepted' },
          {
            where: {
              senderId: req.id,
              recieverId: numberId,
            },
          }
        );
        return res.json({
          statusCode: 200,
          message: 'user un-blocked successfully',
        });
      } else {
        await conversationData.update(
          { state: 'blocked' },
          {
            where: {
              senderId: req.id,
              recieverId: numberId,
            },
          }
        );
        return res.json({
          statusCode: 200,
          message: 'user blocked successfully',
        });
      }
    }
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export const unFriend = async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, '');

    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError('please put valid id ', 400));
    }

    if (req.id == numberId) {
      return next(new ApiError('can not unfriend ', 404));
    }

    const cheackFriend = await conversation.findOne({
      where: {
        senderId: { [Op.or]: [req.id, numberId] },
        recieverId: { [Op.or]: [req.id, numberId] },
      },
    });
    if (!cheackFriend) {
      return res.json({
        statusCode: 404,
        message: 'you are not friend',
      });
    }

    if (cheackFriend) {
      const state = cheackFriend.dataValues.state;
      if (state === 'pending' || state === 'blocked' || state === 'rejected') {
        return res.json({
          statusCode: 400,
          message: 'you are not friend so you can not unfriend',
        });
      }

      if (state === 'accepted') {
        await conversation.destroy({
          where: {
            senderId: { [Op.or]: [req.id, numberId] },
            recieverId: { [Op.or]: [req.id, numberId] },
          },
        });
        return res.json({
          statusCode: 200,
          message: 'you are now unfriend',
        });
      }
    }
  } catch (e: any) {
    return next(new ApiError(e.message, 400));
  }
};
