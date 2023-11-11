import { fetchLastWeeksGifs } from "../src/github";
import { buttonLinkBlock, imageBlock, postMessage } from "../src/slack";

const repoName = Bun.argv[Bun.argv.length - 1];

if (!repoName) {
	console.error("Usage: bun run update-slack.ts <repo-name>");
	process.exit(1);
}

const [owner, repo] = repoName.split("/");

if (!owner || !repo) {
	console.error("Invalid repo name:", repoName);
	process.exit(1);
}

console.info(`Using repo: ${repoName}`);

const entries = await fetchLastWeeksGifs({ owner, repo });

if (entries.length === 0) {
	console.info("No GIF entries found");
	process.exit(0);
}

const timestamp = await postMessage({
	text: "Time to vote for the best gif of the week! 🥇🥈🥉",
});

for (const entry of entries) {
	console.info("Posting entry for:", entry.title);

	await postMessage({
		text: entry.title,
		thread_ts: timestamp,
		blocks: [
			imageBlock(entry.gif, entry.title),
			buttonLinkBlock({ text: entry.title, url: entry.url }),
		],
	});
}
