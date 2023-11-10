import { Block, ImageBlock, SectionBlock, WebClient } from "@slack/web-api";
import invariant from "tiny-invariant";

const Environment = {
	TOKEN(): string {
		const token = Bun.env.SLACK_TOKEN;
		invariant(token, "SLACK_TOKEN is required");
		return token;
	},

	CONVERSATION_ID(): string {
		const conversationId = Bun.env.SLACK_CONVERSATION_ID;
		invariant(
			typeof conversationId === "string",
			"SLACK_CONVERSATION_ID is required",
		);
		return conversationId;
	},
};

const web = new WebClient(Environment.TOKEN());

type Params = {
	text: string;
	thread_ts?: string;
	blocks?: Block[];
};

export async function postMessage(params: Params): Promise<string> {
	const result = await web.chat.postMessage({
		text: params.text,
		channel: Environment.CONVERSATION_ID(),
		thread_ts: params.thread_ts,
		blocks: params.blocks,
	});

	invariant(result.ok, `Request failed: ${result.error}`);
	invariant(result.ts, "Failed to get timestamp");

	return result.ts;
}

export function imageBlock(imageUrl: string, altText: string): ImageBlock {
	return {
		type: "image",
		title: {
			type: "plain_text",
			text: altText,
		},
		block_id: "image4",
		image_url: imageUrl,
		alt_text: altText,
	};
}

interface ButtonLinkBlockParams {
	text: string;
	url: string;
}

export function buttonLinkBlock(params: ButtonLinkBlockParams): SectionBlock {
	return {
		type: "section",
		text: {
			type: "mrkdwn",
			text: params.text,
		},
		accessory: {
			type: "button",
			text: {
				type: "plain_text",
				text: "GitHub PR",
				emoji: true,
			},
			url: params.url,
			action_id: "button-action",
		},
	};
}
