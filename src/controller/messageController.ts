const { messages, conversation, users } = require('../../models/');
import { Op } from 'sequelize';
import { Response, NextFunction } from 'express';
import { ApiError } from '../services/error';
import { v4 as uuid, validate } from 'uuid';
import io from '../socketClient';



export const sendMessage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const myId = uuid();
    const { message } = req.body;
    const numberId: any = id.replace(/[' "]+/g, '');
    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError('please put valid id ', 400));
    }

    if (message.length == 0) {
      return res.json({
        statusCode: 400,
        message: 'message not be empty',
      });
    }

    const messageTrim: string = message.trim();
    const cheackFriend = await conversation.findOne({
      where: {
        senderId: { [Op.or]: [req.id, numberId] },
        recieverId: { [Op.or]: [req.id, numberId] },
      },
      include: [
        {
          model: users,
          attributes: ['fullName'],
          as: 'reciever',
        },
      ],
    });
    // console.log("value>>>>>>>>>>>>>>>>>>>>>>", cheackFriend);

    if (!cheackFriend) {
      return next(new ApiError('you are not friend', 404));
    }
    const value = cheackFriend.state;

    if (req.id === numberId) {
      return res.json({
        statusCode: 400,
        message: 'sender and reciever are not  same ',
      });
    }

    if (value === 'blocked') {
      return res.json({
        statusCode: 400,
        message: 'blocked user can not send request',
      });
    }

    if (value === 'pending') {
      return res.json({
        statusCode: 400,
        message: 'you are not friend',
      });
    }

    if (value === 'unfriend') {
      return res.json({
        statusCode: 400,
        message: 'you are unfriend',
      });
    }

    const createData = await messages.create({
      id: myId,
      to: numberId,
      from: req.id,
      conversationId: cheackFriend.id,
      message: messageTrim,
      state: 'unedited',
    });
    io.emit('chat-message', {
      msg: createData.message,
      conversationId: cheackFriend.id,
      userId: req.id,
      recieverId: numberId,
    });

    const messageData = await messages.findAll({
      where: {
        to: {
          [Op.or]: [numberId, req.id],
        },
        from: {
          [Op.or]: [numberId, req.id],
        },
      },
      include: [
        {
          model: users,
          as: 'reciever',
          attributes: ['fullName', 'id'],
        },
        {
          model: users,
          as: 'sender',
          attributes: ['fullName', 'id'],
        },
      ],
    });


    messageData.forEach((element)=>{
      let timeZone = "";
      if(element.createdAt.getHours()>12){
   timeZone+=`${element.createdAt.getHours()}:${element.createdAt.getMinutes()}pm`
  }else{
  timeZone+=`${element.createdAt.getHours()}:${element.createdAt.getMinutes()}am`
  // timeZone = "am"
  }
   element.timeZone = timeZone
  //  timeZone = ""
  return element
  })
    return res.render('test', {
      data: [],
      userId: req.id,
      conversationId: '',
      userName:req.fullName,
      chatWith: cheackFriend.reciever.fullName,
      friendRequest: '',
      seeRequest: '',
      showmessages: messageData,
      sendMessage: '',
      recieverId: numberId,
    });
  } catch (e: any) {
    // console.log("dddd", e);

    return next(new ApiError(e.message, 404));
  }
};

export const seeMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, '');
    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError('please put valid id ', 400));
    }
    const messageData = await messages.findAll({
      where: {
        to: {
          [Op.or]: [numberId, req.id],
        },
        from: {
          [Op.or]: [numberId, req.id],
        },
      },
      include: [
        {
          model: users,
          as: 'reciever',
          attributes: ['fullName', 'id'],
        },
        {
          model: users,
          as: 'sender',
          attributes: ['fullName', 'id'],
        },
      ],
    });


     messageData.forEach((element)=>{
      let timeZone = "";
      if(element.createdAt.getHours()>12){
   timeZone+=`${element.createdAt.getHours()}:${element.createdAt.getMinutes()}pm`
  }else{
  timeZone+=`${element.createdAt.getHours()}:${element.createdAt.getMinutes()}am`
  // timeZone = "am"
  }
   element.timeZone = timeZone
  //  timeZone = ""
  return element
  })
    




    if (!messageData) {
      return res.json({
        statusCode: 200,
        message: 'no chat found',
      });
    }

    const loginId = req.id;
    const otherUser = id;
    const user = await users.findOne({
      where: {
        id: otherUser,
      },
    });

    res.render('test', {
      data: [],
      userId: loginId,
      conversationId: '',
       userName:req.fullName,
      chatWith: user.fullName,
      friendRequest: '',
      seeRequest: '',
      showmessages: messageData,
      sendMessage: '',
      recieverId: otherUser,
    });
  } catch (e: any) {
    return next(new ApiError(e.message, 404));
  }
};

export const deleteChats = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, '');
    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError('please put valid id ', 400));
    }
    const messageData = await messages.findOne({
      where: {
        id: numberId,
        [Op.or]: [
          {
            to: req.id,
          },
          {
            from: req.id,
          },
        ],
      },
    });
    if (!messageData) {
      return res.json({
        statusCode: 404,
        messages: 'no chat found ',
      });
    }
    if (messageData) {
      const conversationId = messageData.dataValues.conversationId;
      await messages.destroy({
        where: {
          conversationId: conversationId,
        },
      });
      return res.json({
        statusCode: 200,
        message: 'chat deleted successfully',
      });
    }
  } catch (e: any) {
    return next(new ApiError(e.message, 400));
  }
};

export const deleteAllChat = async (req: any, res: Response) => {
  try {
    const messageData = await messages.findAll({
      where: {
        from: req.id,
      },
    });

    if (messageData.length == 0) {
      return res.json({
        statusCode: 'no chat found',
      });
    }

    if (messageData) {
      const checkMessage = messageData.dataValues.messages;
      if (checkMessage.length === 0) {
        return res.json({
          statusCode: 400,
          message: 'chats already deleted',
        });
      }
      await messages.destroy({
        where: {
          from: req.id,
        },
      });
      return res.json({
        statusCode: 400,
        messages: 'all chat deleted successfully',
      });
    }
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export const editmessage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, '');
    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError('please put valid id ', 400));
    }
    const { message }: { message: string } = req.body;
    if (!message) {
      return res.json({
        statusCode: 400,
        message: 'message is required',
      });
    }
    if (message.length == 0) {
      return res.json({
        statusCode: 400,
        message: 'message not be empty',
      });
    }
    const messageTrim: string = message.trim();

    const messageData = await messages.findOne({
      where: {
        id: numberId,
        [Op.or]: [
          {
            to: req.id,
          },
          {
            from: req.id,
          },
        ],
      },
    });
    if (!messageData) {
      return res.json({
        statusCode: 400,
        message: 'no chat found',
      });
    }
    const messageId = messageData.from;
    if (messageId != req.id) {
      return res.json({
        statusCode: 400,
        message: 'you can not edit message',
      });
    } else {
      await messages.update(
        {
          message: messageTrim,
          state: 'edited',
        },
        {
          where: {
            from: req.id,
          },
        }
      );

      io.emit('edit', {
        userId: req.id,
        message: messageTrim,
        status: 'edited',
      });

      return res.json({
        statusCode: 200,
        message: 'message edited successfully',
      });
    }
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};
