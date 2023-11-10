import { fetchLastWeeksGifs } from "../src/github";
import { buttonLinkBlock, imageBlock, postMessage } from "../src/slack";

const timestamp = await postMessage({
	text: "Time to vote for the best gif of the week! 🥇🥈🥉",
});

const entries = await fetchLastWeeksGifs({
	owner: "HedvigInsurance",
	repo: "racoon",
});

for (const entry of entries) {
	console.log("Posting entry for:", entry.title);

	await postMessage({
		text: entry.title,
		thread_ts: timestamp,
		blocks: [
			imageBlock(entry.gif, entry.title),
			buttonLinkBlock({ text: entry.title, url: entry.url }),
		],
	});
}
