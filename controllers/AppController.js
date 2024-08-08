import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import express, { application } from 'express';

class AppController {
  static async getStatus(req, res) {
    const redisIsAlive = await redisClient.isAlive();
    const dbIsAlive = await dbClient.isAlive();
    res.status(200).json({ redis: redisIsAlive, db: dbIsAlive });
  }

  static async getStats(req, res) {
    try {
      const nbOfusers = await dbClient.nbUsers();
      const nbOfFiles = await dbClient.nbFiles();

      res.status(200).json({ users: nbOfusers, files: nbOfFiles });
    } catch (err) {
      res.status(500).json({ error: 'Unable to get stats' });
    }
  }
}

export default AppController;
