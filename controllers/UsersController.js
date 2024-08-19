import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  // create a new user
  // check email is missing of not
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // check if user email in the db
    if (await dbClient.userExists(email)) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex');

    const newUser = { email, password: hashedPassword };

    const userId = await dbClient.addUser(newUser);
    res.status(201).json({ email, id: userId });
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    const key = `auth_${token}`;

    const userId = await redisClient.get(key);
    const user = await dbClient.getUserById(userId);
    if (user) {
      return res.json({ email: user.email, id: user._id });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export default UsersController;
