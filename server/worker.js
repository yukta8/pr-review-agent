require("dotenv").config();
const { Worker } = require("bullmq");
const { connection } = require("./queue");
const { fetchDiff, postReviewComments } = require("./github");
const { reviewDiff } = require("./ai");
const { connectDB, saveReview } = require("./db");

connectDB();

const worker = new Worker(
  "pr-review",
  async (job) => {
    // console.log("Processing job: ", job.id);
    // console.log("PR #: ", job.data.prNumber);
    // console.log("Repo: ", job.data.repoName);
    // console.log("Diff URL", job.data.diffUrl);

    // console.log("Job: ",job);

    const { prNumber, repoName, diffUrl, prTitle } = job.data;

    console.log(`Reviewing PR #${prNumber}: ${prTitle}`);

    console.log("Fetching diff");
    const diff = await fetchDiff(repoName, prNumber);
    console.log(`Diff size: ${diff.length} chars`);
    //phase 3 fetch diff + call ai

    console.log("Sending to Claude...");
    const comments = await reviewDiff(diff);
    console.log(`Claude returned ${comments.length} comments`);

    if (comments.length > 0) {
      console.log("Posting comments to github");
      await postReviewComments(repoName, prNumber, comments);
      console.log("Saving review to DB");
      await saveReview(repoName, prNumber, prTitle, comments);
    } else {
      console.log("No issues found, PR looks good!");
    }
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed: `, err.message);
});

console.log("Worker is listening for jobs");
