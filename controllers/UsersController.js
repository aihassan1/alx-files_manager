import dbClient from '../utils/db';
import crypto from 'crypto';

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

    const newUser = { email: email, password: hashedPassword };

    const userId = await dbClient.addUser(newUser);
    res.status(201).json({ email: email, id: userId });
  }
}

export default UsersController;
