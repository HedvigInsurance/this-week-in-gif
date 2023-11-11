import { Octokit } from "@octokit/rest";
import invariant from "tiny-invariant";

const Environment = {
	ACCESS_TOKEN(): string {
		const token = Bun.env.GITHUB_ACCESS_TOKEN;
		invariant(token, "GITHUB_ACCESS_TOKEN is required");
		return token;
	},
};

const octokit = new Octokit({ auth: Environment.ACCESS_TOKEN() });

interface PullRequest {
	pull_number: number;
	title: string;
	url: string;
}

interface RepoParams {
	owner: string;
	repo: string;
}

function getMostRecentMonday(): Date {
	const today = new Date();
	const dayOfWeek = today.getDay();
	const daysSinceMonday = (dayOfWeek === 0 ? 7 : dayOfWeek) - 1;
	const monday = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate() - daysSinceMonday,
	);
	monday.setHours(0, 0, 0, 0);
	return monday;
}

async function getPullRequestsSinceLastMonday(
	params: RepoParams,
): Promise<PullRequest[]> {
	const response = await octokit.pulls.list({
		owner: params.owner,
		repo: params.repo,
		state: "all",
		sort: "created",
		direction: "desc",
		per_page: 100,
	});

	const lastMonday = getMostRecentMonday();

	return response.data
		.filter((pull) => new Date(pull.created_at) > lastMonday)
		.map((pull) => ({
			pull_number: pull.number,
			title: pull.title,
			url: pull._links.html.href,
		}));
}

interface Review {
	login: string;
	body: string;
}

type ReviewParams = RepoParams & {
	pull_number: number;
};

async function getReviews(params: ReviewParams): Promise<Review[]> {
	const response = await octokit.pulls.listReviews({
		owner: params.owner,
		repo: params.repo,
		pull_number: params.pull_number,
	});

	return response.data
		.filter((item) => item.user)
		.map((item) => {
			invariant(item.user, "User is required");

			return {
				login: item.user.login,
				body: item.body,
			};
		});
}

function getGiphyUrl(review: Review): string | undefined {
	return review.body.match(
		/https:\/\/media\d?.giphy.com\/media\/\w+\/giphy.gif/,
	)?.[0];
}

interface Gif {
	title: string;
	url: string;
	login: string;
	gif: string;
}

export async function fetchLastWeeksGifs(params: RepoParams): Promise<Gif[]> {
	const pullRequests = await getPullRequestsSinceLastMonday(params);
	console.debug(`PRs since last Monday: ${pullRequests.length}`);

	const reviews = await Promise.all(
		pullRequests.map(async (item) => {
			console.debug(`Fetching reviews for PR: ${item.title}`);
			const reviews = await getReviews({
				...params,
				pull_number: item.pull_number,
			});

			return reviews.map((review) => ({ ...review, pullRequest: item }));
		}),
	);

	return reviews
		.flatMap((item) =>
			item.map((review) => {
				const url = getGiphyUrl(review);
				return url
					? {
							title: review.pullRequest.title,
							url: review.pullRequest.url,
							login: review.login,
							gif: url,
					  }
					: undefined;
			}),
		)
		.filter((item): item is Gif => !!item);
}
