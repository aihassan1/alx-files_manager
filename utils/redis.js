import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor(host = 'localhost', port = 6379) {
    this.client = redis.createClient({ host, port });
    this.client.on('error', (err) => {
      console.log(err);
    });
  }

  async isAlive() {
    const asyncPing = promisify(this.client.ping).bind(this.client);
    try {
      await asyncPing();
      return true;
    } catch (err) {
      return false;
    }
  }

  async get(key) {
    const asyncGet = promisify(this.client.get).bind(this.client);
    return asyncGet(key);
  }

  async set(key, value, duration) {
    const asyncSet = promisify(this.client.set).bind(this.client);
    return asyncSet(key, value, 'EX', duration);
  }

  async del(key) {
    const asyncDel = promisify(this.client.del).bind(this.client);
    return asyncDel(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
