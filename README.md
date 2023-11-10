# bestgif

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.7. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Usage

1. Go to slack and type in `/best-gif`.
2. The GIFs since last Monday will be displayed.
3. Invite people to rank the best GIF by reacting with 1️⃣, 2️⃣, and 3️⃣.
4. Type in `/best-gif` again to see the results.

## 1

Vercel cronjob runs every Monday at 9am UTC to post the GIFs from the week

{
  "text": "Rank the best GIFs from the past week!",
}
