// const bullmq = require("bullmq");
// console.log(bullmq);
const { Queue } = require("bullmq");

const connection = {
  host: "127.0.0.1",
  port: 6379,
};

const reviewQueue = new Queue("pr-review", { connection });
module.exports = { reviewQueue, connection };
