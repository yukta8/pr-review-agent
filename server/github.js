const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function fetchDiff(repoName, prNumber) {
  const [owner, repo] = repoName.split("/");
  try {
    const { data: diff } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: { format: "diff" },
    });
    return diff;
  } catch (err) {
    console.log("Failed to fetch diff:", err.message);
    throw err;
  }

  //   const response = await fetch(diffUrl, {
  //     headers: {
  //       Authorization: `token ${process.env.GITHUB_TOKEN}`,
  //       Accept: "application/vnd.github.v3.diff",
  //     },
  //   });
  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch diff: ${response.status}`);
  //   }

  //   const diff = await response.text;
}

async function postReviewComments(repoName, prNumber, comments) {
  const [owner, repo] = repoName.split("/");
  try {
    const { data: pr } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    const commitSha = pr.head.sha;
    for (const comment of comments) {
      try {
        await octokit.pulls.createReviewComment({
          owner,
          repo,
          pull_number: prNumber,
          commit_id: commitSha,
          path: comment.file,
          line: comment.line,
          body: comment.comment,
        });
        console.log(`Posted comment on ${comment.file} line ${comment.line}`);
      } catch (err) {
        console.log(
          `Skipped comment on ${comment.file}:${comment.line} - ${err.message}`,
        );
      }
    }
  } catch (err) {
    console.log("Failed to get PR details:", err.message);
    throw err;
  }
}

module.exports = { fetchDiff, postReviewComments };
