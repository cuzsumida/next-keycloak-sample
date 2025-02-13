import { Redis } from "ioredis"
import { createStorage } from 'unstorage';
import redisDriver from 'unstorage/drivers/redis';

const redis = new Redis({
  host: "localhost",
  port: 6379,
});

const storage = createStorage({
  driver: redisDriver({
    // host: 'localhost',
    // port: 6379,
    url: 'redis://localhost:6379',
  }),
});

export { redis, storage }