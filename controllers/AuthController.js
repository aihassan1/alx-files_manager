import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    // get the encoded string and decode it

    const authHeader = req.headers.authorization || req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const encodedStr = authHeader.split(' ')[1];

    const decodedStr = Buffer.from(encodedStr, 'base64').toString('utf-8');
    const [email, password] = decodedStr.split(':');
    // console.log(`${email},  ${password}`);

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hashedPassword = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex');

    try {
      const user = await dbClient.getUser(email);
      if (!user || user.password !== hashedPassword) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      const key = `auth_${token}`;

      // store the token in redis for 24 hrs
      await redisClient.set(key, user._id.toString(), 24 * 3600);

      res.status(200).json({ token });
    } catch (err) {
      if (err.message === 'User does not exist')
        return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;

    const user = await redisClient.get(key);

    if (user) {
      await redisClient.del(key);
      return res.status(204).end();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export default AuthController;
