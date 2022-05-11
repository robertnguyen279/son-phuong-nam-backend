import express from 'express';
import {
  createUser,
  loginUser,
  getUser,
  updateUser,
  getUserById,
  createUserByAdmin,
  updateUserBySuperviser,
  deleteUserBySuperviser,
  getUsers,
  getAccessToken,
  logoutUser,
  updateUserByAdmin,
  deleteUserByAdmin,
  loginByThirdParty,
  changePassword
} from 'controllers/user.controller';
import authMiddleware from 'middlewares/auth.middleware';
import superviserMiddleware from 'middlewares/superviser.middleware';
import adminMiddleware from 'middlewares/admin.middleware';
const router = express.Router();

router.post('/', createUser);
router.post('/createByAdmin', authMiddleware, superviserMiddleware, adminMiddleware, createUserByAdmin);
router.post('/token', getAccessToken);
router.post('/loginByThirdParty', loginByThirdParty);
router.delete('/logout', authMiddleware, logoutUser);
router.patch('/', authMiddleware, updateUser);
router.post('/login', loginUser);
router.patch('/password', authMiddleware, changePassword);
router.get('/findUsers', authMiddleware, superviserMiddleware, getUsers);
router.get('/', authMiddleware, getUser);
router.get('/:id', authMiddleware, superviserMiddleware, getUserById);
router.patch('/admin/:id', authMiddleware, superviserMiddleware, adminMiddleware, updateUserByAdmin);
router.delete('/admin/:id', authMiddleware, superviserMiddleware, adminMiddleware, deleteUserByAdmin);
router.delete('/:id', authMiddleware, superviserMiddleware, deleteUserBySuperviser);
router.patch('/:id', authMiddleware, superviserMiddleware, updateUserBySuperviser);

export default router;
