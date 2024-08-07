import { MongoClient } from 'mongodb';
import { env } from 'process';

const host = env.DB_HOST || 'localhost';
const port = env.DB_PORT || 27017;
const database = env.DB_DATABASE || 'files_manager';
class DBClient {
  constructor() {
    const url = `mongodb://${host}:${port}/${database}`;
    this.client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.db = null;
    this.connect();
  }
  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(database);
      // console.log('connected to the db');
    } catch (err) {
      console.error('Failed to connect to the db:', err);
      throw err;
    }
  }
  isAlive() {
    return this.db !== null;
  }

  async nbUsers() {
    if (!this.isAlive()) {
      throw new Error('There is no connection to the db');
    }

    try {
      const nbOfDocs = await this.db.collection('users').countDocuments();
      return nbOfDocs;
    } catch (err) {
      console.error('error counting users');
      throw err;
    }
  }

  async nbFiles() {
    if (!this.isAlive()) {
      throw new Error('There is no connection to the db');
    }

    try {
      const nbOfDocs = await this.db.collection('files').countDocuments();
      return nbOfDocs;
    } catch (err) {
      console.error('error while counting files');
      throw err;
    }
  }

  async addUser(user) {
    if (!this.isAlive()) {
      throw new Error('There is no connection to the db');
    }
    const result = await this.db.collection('users').insertOne(user);
    return result.insertedId;
  }

  async addFile(file) {
    if (!this.isAlive()) {
      throw new Error('There is no connection to the db');
    }
    const result = await this.db.collection('files').insertOne(file);
    return result.insertedId;
  }
}

const dbClient = new DBClient();

export default dbClient;
