// const Anthropic = require("@anthropic-ai/sdk");
const Groq=require("groq-sdk")

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
// const client = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// });

async function reviewDiff(diff) {
  const trimmedDiff =
    diff.length > 6000 ? diff.slice(0, 6000) + "\n... (truncated)" : diff;
  try {
    const message = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are a senior software engineer reviewing a pull request.

Review this diff and return a JSON array of comments. Each comment must have:
- "file": the filename (e.g. "src/index.js")
- "line": the line number in the diff to comment on (must be a changed line, starting with + or -)
- "comment": your review comment (be specific and helpful)

Only comment on real issues — bugs, security problems, missing error handling, bad practices.
If the code looks fine, return an empty array: []

Return JSON only. No explanation, no markdown, no backticks.

Diff:
${trimmedDiff}`,
        },
      ],
    });
    const text = message.choices[0].message.content;
    try {
      return JSON.parse(text);
    } catch {
      console.log("Groq returned invalid json: ", text);
      return [];
    }
  } catch (err) {
    console.log("Failed to call Groq API: ", err.message);
    throw err;
  }
}

module.exports = { reviewDiff };
