// const bullmq = require("bullmq");
// console.log(bullmq);
const { Queue } = require("bullmq");

const connection = {
  host: process.env.REDISHOST,
  port: process.env.REDISPORT,
  password: process.env.REDIS_PASSWORD
};

const reviewQueue = new Queue("pr-review", { connection });
module.exports = { reviewQueue, connection };
