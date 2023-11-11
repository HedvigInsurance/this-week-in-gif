# this-week-in-gif

This repo contains a script that will:

1. Fetch all GitHub pull requests opened since last Monday

1. Find all GIFs posted in the related pull request reviews

1. Post a thread in Slack with all the GIFs

Now you can rank the best GIFs from the past week by reacting to your favorites! 🥇🥈🥉

## Getting started

To run this script you'll need to install [Bun](https://bun.sh).

To install dependencies:

```bash
bun install
```

To configure you need to set the following environment variables:

- `GITHUB_ACCESS_TOKEN` - A [GitHub access token](https://github.com/settings/tokens?type=beta) with `repo` scope

- `SLACK_TOKEN` - A [Slack Bot User OAuth Token](https://api.slack.com/apps) that you can find in the "OAuth & Permissions" section of your Slack app

- `SLACK_CONVERSATION_ID` - The ID of the Slack channel you want to post to. You can find this in the URL of the channel. For example, if the URL is `https://app.slack.com/client/T12345678/C12345678` then the ID is `C12345678`.

To run:

```bash
bun run src/cli.ts
```

## Contributing

This project uses [Biome](https://biomejs.dev/guides/getting-started) to format and lint code. You probably want to install the [Biome VSCode extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) to get automatic formatting on save.
