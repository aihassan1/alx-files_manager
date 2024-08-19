import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import UsersController from './UsersController';
import { isErrored } from 'stream';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

class FilesController {
  static async postUpload(req, res) {
    try {
      const user = await UsersController.getAuthedUser(req, res);

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
        console.log(parentId);
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
        userId: user._id,
        name: name,
        type: type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
        ...(type !== 'folder' && { localPath: localPath }),
      };

      const result = await dbClient.addFile(newFile);
      const response = {
        id: result,
        userId: user._id,
        name: name,
        type: type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
      };

      return res.status(201).json(response);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getShow(req, res) {
    const user = await UsersController.getAuthedUser(req, res);

    const fileId = req.params.id;
    const file = await dbClient.getFile(fileId);
    if (!file || file.userId !== user._id) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    try {
      const user = await UsersController.getAuthedUser(req, res);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const parentId = req.query.parentId || 0;

      const listOfFiles = (await dbClient.getAllFiles(parentId)) || [];

      return res.status(200).json(listOfFiles);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'internal server error' });
    }
  }
}

export default FilesController;
