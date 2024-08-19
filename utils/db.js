import { MongoClient, ObjectId } from 'mongodb';
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

  async userExists(email) {
    if (!this.isAlive()) {
      throw new Error('There is no connection to the db');
    }
    try {
      const result = await this.db.collection('users').findOne({ email });
      return result !== null;
    } catch (err) {
      console.error('Error while checking if user exists:', err);
      throw err;
    }
  }

  async getUser(email) {
    if (!(await this.userExists(email))) {
      throw new Error('User does not exist');
    }
    const user = await this.db.collection('users').findOne({ email });
    return user;
  }

  async getUserById(id) {
    try {
      const objectId = new ObjectId(id);
      const user = await this.db.collection('users').findOne({ _id: objectId });
      return user;
    } catch (err) {
      console.error('Error fetching user by ID:', err);
      throw err;
    }
  }

  async addFile(file) {
    if (!this.isAlive()) {
      throw new Error('There is no connection to the db');
    }
    const result = await this.db.collection('files').insertOne(file);
    return result.insertedId;
  }

  async getFile(fileId) {
    if (!this.isAlive) {
      throw new Error('There is no connection to the db');
    }
    const fileObjectID = new ObjectId(fileId);
    const file = await this.db
      .collection('files')
      .findOne({ _id: fileObjectID });

    return file;
  }

  async getAllFiles(parentId) {
    if (!this.isAlive) {
      throw new Error('There is no connection to the db');
    }
    const files = this.db
      .collection('files')
      .find({ parentId: parentId })
      .toArray();
    return files;
  }
}

const dbClient = new DBClient();

export default dbClient;
