import { buttonLinkBlock, imageBlock, postMessage } from "./src/slack";

const timestamp = await postMessage({ text: "Hello world!" });

console.log(`Successfully send message ${timestamp}`);

await postMessage({
	text: "Hello, Thread!",
	thread_ts: timestamp,
	blocks: [
		imageBlock("http://placekitten.com/500/500", "An incredibly cute kitten."),
		buttonLinkBlock({
			text: "This is a section block with a button.",
			url: "https://google.com",
		}),
	],
});

console.log(`Successfully responded to thread ${timestamp}`);
