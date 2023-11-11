import { fetchLastWeeksGifs } from "./github";
import { input, confirm } from "@inquirer/prompts";
import { buttonLinkBlock, imageBlock, postMessage } from "./slack";

const owner = await input({ message: "Enter GitHub username/organization" });
const repo = await input({ message: "Enter GitHub repository name" });

const entries = await fetchLastWeeksGifs({ owner, repo });

if (!entries.length) {
	console.info("No entries found");
	process.exit();
}

console.info(`Found ${entries.length} entries`);

const answer = await confirm({ message: "Post to Slack?" });

if (!answer) {
	process.exit();
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
