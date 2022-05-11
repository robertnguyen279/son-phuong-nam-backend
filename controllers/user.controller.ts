import { Request, Response, NextFunction } from 'express';
import User from 'models/user.model';
import { filterRequestBody } from 'services/common.service';
import { UserDocument } from 'types/user.type';
import validator from 'validator';
import { NotFoundError, WrongPasswordError, InvalidQueryError } from 'services/error.service';
import axios from 'axios';

const signupKeys = ['firstName', 'lastName', 'email', 'password*', 'phone'];
const updateKeys = ['firstName', 'lastName', 'email', 'password', 'phone'];
const signupByThirdPartyKeys = ['firstName', 'lastName', 'email', 'avatarUrl', 'thirdPartyToken'];
const signupByAdminKeys = ['firstName', 'lastName', 'email', 'password', 'phone', 'role'];
const loginKeys = ['emailOrPhone', 'password'];

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    filterRequestBody(signupKeys, req.body);

    const user = new User(req.body);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    await user.save();

    return res.status(201).send({
      statusCode: 201,
      message: 'Create user successfully',
      accessToken,
      refreshToken,
      user: { ...user._doc, password: undefined, fullName: user.fullName }
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emailOrPhone, password } = filterRequestBody(loginKeys, req.body);
    let user;

    if (validator.isEmail(emailOrPhone)) {
      user = await User.findOne({ email: emailOrPhone }).select('-refreshToken');
    } else if (validator.isMobilePhone(emailOrPhone.toString(), ['vi-VN'])) {
      user = await User.findOne({ phone: emailOrPhone }).select('-refreshToken');
    }

    if (!user) {
      throw new NotFoundError('User');
    }

    if (!user.comparePassword(password)) {
      throw new WrongPasswordError();
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    await user.save();

    return res.send({
      statusCode: 200,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { ...user._doc, password: undefined, fullName: user.fullName, refreshToken: undefined }
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = (req: Request, res: Response) => {
  const user = req.authUser as UserDocument;

  return res.send({
    message: 'Get user successfully',
    statusCode: 200,
    user: { ...user._doc, fullName: user.fullName }
  });
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.authUser as UserDocument;
    filterRequestBody(updateKeys, req.body);

    for (const key in req.body) {
      user[key] = req.body[key];
    }
    await user.save();

    return res.send({ message: 'Update user successfully', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id).select('-refreshToken -password');

    if (!user) {
      throw new NotFoundError('User');
    }

    return res.send({
      message: 'Get user successfully',
      statusCode: 200,
      user: { ...user._doc, fullName: user.fullName }
    });
  } catch (error) {
    next(error);
  }
};

export const createUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    filterRequestBody(signupByAdminKeys, req.body);
    const user = new User(req.body);
    await user.save();

    return res.status(201).send({
      statusCode: 200,
      message: 'Create user successfully',
      user: { ...user._doc, password: undefined }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserBySuperviser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    filterRequestBody(signupByAdminKeys, req.body);

    if (req.body.password) {
      req.body.password = await User.generateHashPassword(req.body.password);
    }

    const doc = await User.findOneAndUpdate({ _id: id, role: 'user' }, req.body);

    if (!doc) {
      throw new NotFoundError('User');
    }

    return res.send({ message: 'Update user successfully', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const updateUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    filterRequestBody(signupByAdminKeys, req.body);

    if (req.body.password) {
      req.body.password = await User.generateHashPassword(req.body.password);
    }

    await User.findOneAndUpdate({ _id: id, role: { $in: ['user', 'superviser'] } }, req.body);

    return res.send({ message: 'Update user successfully', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const deleteUserBySuperviser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const doc = await User.findOneAndDelete({ _id: id, role: 'user' });
    if (!doc) {
      throw new NotFoundError('User');
    }

    return res.send({ message: 'Delete user successfully', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const deleteUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const doc = await User.findOneAndDelete({ _id: id, role: { $in: ['user', 'superviser'] } });
    if (!doc) {
      throw new NotFoundError('User');
    }

    return res.send({ message: 'Delete user successfully', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt';
    const order = req.query.order ? req.query.order : 'desc';

    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .sort([[sortBy, order]])
      .select('-refreshToken -password');

    if (!users) {
      throw new NotFoundError('Users');
    }

    const deepCloneUsers = JSON.parse(JSON.stringify(users));

    deepCloneUsers.forEach((user) => {
      user.fullName = `${user.firstName} ${user.lastName}`;
    });

    return res.send({ message: 'Get users successfully', statusCode: 200, users: deepCloneUsers });
  } catch (error) {
    next(error);
  }
};

export const getAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = filterRequestBody(['token'], req.body);

    const user = await User.verifyRefreshToken(token);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    await user.save();

    return res.send({
      message: 'Get new access token successfully',
      statusCode: 200,
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.authUser as UserDocument;

    await User.updateOne({ _id: user._id }, { $unset: { refreshToken: 1 } });
    return res.send({ message: 'Logout successfully', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const loginByThirdParty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type;
    const { firstName, lastName, email, avatarUrl, thirdPartyToken } = filterRequestBody(
      signupByThirdPartyKeys,
      req.body
    );

    if (type === 'google') {
      await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${thirdPartyToken}`);
    } else if (type === 'facebook') {
      await axios.get(`https://graph.facebook.com/me?access_token=${thirdPartyToken}`);
    } else {
      throw new InvalidQueryError('type');
    }

    let user: UserDocument | null;

    user = await User.findOne({ email });

    if (!user) {
      user = new User({ firstName, lastName, email, avatarUrl });
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    await user.save();

    res.send({ statusCode: 200, message: `Login by ${type} successfully`, user, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (await User.findById(req.authUser?._id)) as UserDocument;
    const { oldPassword, newPassword } = filterRequestBody(['oldPassword', 'newPassword'], req.body);

    if (!user.comparePassword(oldPassword)) {
      throw new WrongPasswordError();
    }

    user.password = newPassword;

    await user.save();
    res.send({ statusCode: 200, message: 'Update password successfully' });
  } catch (error) {
    next(error);
  }
};
