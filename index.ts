import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: Bun.env.GITHUB_ACCESS_TOKEN });

const repos = [{ owner: "HedvigInsurance", repo: "racoon" }] as const;
type Repo = typeof repos[number];

type PullRequest = {
	pull_number: number;
	title: string;
	url: string;
};

type Review = {
	login: string;
	body: string;
};

async function getPullRequestsSinceLastMonday(
	repo: Repo,
): Promise<PullRequest[]> {
	const response = await octokit.pulls.list({
		owner: repo.owner,
		repo: repo.repo,
		state: "closed",
		sort: "created",
		direction: "desc",
		per_page: 100,
	});

	const lastMonday = new Date();
	lastMonday.setDate(lastMonday.getDate() - lastMonday.getDay() + 1);
	lastMonday.setHours(0, 0, 0, 0);

	return response.data
		.filter((pull) => new Date(pull.created_at) > lastMonday)
		.map((pull) => ({
			pull_number: pull.number,
			title: pull.title,
			url: pull._links.html.href,
		}));
}

async function getReviewGif(
	repo: Repo,
	pullRequest: PullRequest,
): Promise<Review[]> {
	const response = await octokit.pulls.listReviews({
		owner: repo.owner,
		repo: repo.repo,
		pull_number: pullRequest.pull_number,
	});

	return response.data
		.filter((item) => item.user)
		.map((item) => {
			const login = item.user?.login;
			if (!login) throw new Error(`No login for item: ${item.id}`);

			return {
				login,
				body: item.body,
			};
		});
}

function getGiphyUrl(review: Review): string | undefined {
	return review.body.match(
		/https:\/\/media\d.giphy.com\/media\/\w+\/giphy.gif/,
	)?.[0];
}

type Gif = {
	title: string;
	url: string;
	login: string;
	gif: string;
};

const repo = repos[0];
const pullRequests = await getPullRequestsSinceLastMonday(repo);
const reviews = await Promise.all(
	pullRequests.map(async (item) => {
		const reviews = await getReviewGif(repo, item);
		return reviews.map((review) => ({ ...review, pullRequest: item }));
	}),
);
const gifs = reviews
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

for (const gif of gifs) {
	console.log(gif);
}
