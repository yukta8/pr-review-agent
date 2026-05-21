require("dotenv").config();
const { reviewQueue } = require("./queue");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("PR Review Agent is running");
});

app.post("/webhook", async (req, res) => {
  res.status(200).send("ok");

  const signature = req.headers["x-hub-signature-256"];
  const hmac = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET);
  const digest =
    "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");

  if (signature !== digest) {
    console.log("Invalid signature, ignoring request!");
    return;
  }

  const event = req.headers["x-github-event"];

  console.log("Webhook received!");
  console.log("Event: ", event);

  fs.writeFileSync("payload.json", JSON.stringify(req.body, null, 2));
  console.log("File saved");
  // console.log(JSON.stringify(req.body,null,2));

  if (event == "pull_request") {
    const action = req.body.action;
    const prTitle = req.body.pull_request.title;
    const repoName = req.body.repository.full_name;
    const prNumber = req.body.pull_request.number;
    // const diffUrl = req.body.pull_request.diff_url;

    console.log("Action: ", action);
    console.log("PR Title: ", prTitle);
    console.log("Repository Name: ", repoName);
    console.log("PR Number: ", prNumber);
    // console.log("Diff URL: ", diffUrl);
    console.log("action", action);
    if (
      action === "opened" ||
      action === "synchronize" ||
      action === "reopened"
    ) {
      console.log("New PR to review: ", prTitle);
      //phase2
      await reviewQueue.add("review-pr", {
        prNumber,
        repoName,
        // diffUrl,
        prTitle,
      });
      console.log("Job added to queue");
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
