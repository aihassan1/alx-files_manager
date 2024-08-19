import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

class FilesController {
  static async postUpload(req, res) {
    try {
      // check if the user is authorized
      const token = req.header('X-Token');
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.getUserById(userId);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      // check if input data is valid

      const { name, type, parentId, isPublic, data } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }
      const acceptedDataTypes = ['folder', 'file', 'image'];

      if (!type || !acceptedDataTypes.includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' });
      }

      if (parentId) {
        const parent = await dbClient.getFile(parentId);
        if (!parent) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (parent.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      // add user id to the file as an owner

      const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = uuidv4();
      const localPath = path.join(FOLDER_PATH, fileName);

      if (type !== 'folder') {
        const fileData = Buffer.from(data, 'base64');
        await mkdir(FOLDER_PATH, { recursive: true });
        await writeFile(localPath, fileData);
      }

      const newFile = {
        userId: userId,
        name: name,
        type: type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
        ...(type !== 'folder' && { localPath: localPath }),
      };

      const result = await dbClient.addFile(newFile);
      const response = {
        id: result,
        userId: userId,
        name: name,
        type: type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
      };

      return res.status(201).json(response);
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
