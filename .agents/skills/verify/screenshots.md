# Screenshots

Before/after screenshots show reviewers what a change looks like, and the a8ci18n bot asks for one of every new or changed string. Take them with `browse.cjs` (see [browser.md](browser.md)) and a test account, never the user's own.

## 1. Plan the shots

Decide once, without asking the user unless the change leaves it unclear:

- **What to capture:** the state the change is about, e.g. the open modal, the error notice, the row with the new badge. A page that merely loads proves nothing.
- **Which pages:** one shot per page or state the diff changes. Usually one to three.
- **Viewport:** the default `1440x1000`. Add `390x844` when the change touches responsive styles or a layout that wraps on mobile.
- **Crop:** pass `--clip <selector>` to capture only the changed component, e.g. `--clip '.dataviews-wrapper'`. Use a selector you've seen on the page, not a guess (the Dashboard has no `<header>`). Keep the whole viewport when the surrounding layout matters.
- **Arrow:** on after shots only, pass `--arrow <selector>` to point at the changed element, e.g. a new column header. Skip it when the whole shot is the change, or the change removes something.

Save every shot in one directory outside the repository (`browse.cjs` refuses paths inside it), e.g. your scratchpad directory or `OUT=$(mktemp -d -t calypso-shots.XXXXXX)`. Name them `before-<slug>.png` and `after-<slug>.png`, with one short `<slug>` per page or state, e.g. `sites-list`, `php-column-mobile`.

Unless the user already asked for screenshots, ask whether they want them, naming the shots you planned. When no one is there to answer, take them without asking.

## 2. Capture the after shots

With the change in place:

```bash
node .agents/skills/verify/scripts/browse.cjs /sites --no-snapshot \
	--wait-for 'text=PHP' --screenshot "$OUT/after-sites-list.png" \
	--arrow 'role=columnheader[name="PHP"]'
```

To reach a state by interacting, do it in `--eval`; `--screenshot` runs after it. For several shots in one run, call `screenshot( path, { selector, fullPage, arrow } )` in the eval:

```js
await screenshot( `${ process.env.OUT }/after-sites-list.png`, {
	arrow: 'role=columnheader[name="PHP"]',
} );
await page.getByRole( 'button', { name: 'View options' } ).click();
await screenshot( `${ process.env.OUT }/after-view-options.png`, {
	selector: '.components-popover',
} );
```

Run it with `OUT` exported so `process.env.OUT` resolves.

## 3. Capture the before shots

Capture the same pages, viewports and states without the change, with the same commands and `before-` in place of `after-`, without `--arrow`.

Take them on production by default: the same path on `https://my.wordpress.com` (Dashboard) or `https://wordpress.com` (classic Calypso and the Reader). It runs the deployed `trunk` with the same API and saved test-account session, and leaves the working tree alone, so the before and after shots can run at the same time.

Use the local dev server on `trunk` only when production can't show the baseline:

- the page or feature isn't on production yet, e.g. it's new in `trunk` or behind a feature flag that only the local config turns on;
- the before and after shots differ in more than the change (step 4), e.g. because of a local-only flag or a `trunk` change that hasn't been deployed yet.

Switching disturbs anyone else working in the tree or checking its dev server, so ask first if the user or another agent might be. When no one can answer, don't switch: take after shots only and report that the before shots are missing. Then:

1. Check `git status`. With uncommitted changes, set them aside in a temporary commit: `git add -A && git commit --no-verify -m 'WIP: before shots'`. Don't use `git stash`: every worktree shares its stack, so another session can pop your entry.
2. Run `git switch --detach $(git merge-base HEAD origin/trunk)`.
3. Wait a few seconds for webpack to notice. The dev server holds requests until the rebuild is done, so the next `browse.cjs` run sees the old code.
4. Capture the before shots.
5. Restore right away, even if a capture failed: `git switch -` back to the branch, then `git reset HEAD~` if you made the temporary commit. Check with `git status` and `git branch --show-current` that the tree is as you found it.

For a new screen or a new string with nothing to compare, take after shots only.

## 4. Check every shot

Open each PNG (the Read tool shows images) before using it, and retake any that:

- doesn't show the state the change is about, or shows it half loaded (spinners, placeholders, `STILL LOADING` in the report);
- is covered by a tour popover, notice or cookie banner (dismiss it in `--eval`);
- shows anything personal or internal: a real person's name, email or avatar, a private site, an internal hostname, a sandbox banner;
- has an arrow pointing at the wrong element.

Before and after should match in viewport, crop, account and scroll position, so the only difference is the change.

Then preview them for the user before uploading anything. When no one is there to see it, skip this:

```bash
node .agents/skills/verify/scripts/preview.cjs "$OUT" # writes a throwaway $OUT/preview.html
open "$OUT/preview.html"
```

## 5. Put them in the PR

The table goes under `## What`, after its paragraph, as in [create-pr](../create-pr/SKILL.md). Reference each image by its path relative to `$OUT`. With one pair, use just the two columns:

```markdown
| Before                             | After                            |
| ---------------------------------- | -------------------------------- |
| ![before](./before-sites-list.png) | ![after](./after-sites-list.png) |
```

With several pairs, add a first column naming each page or state:

```markdown
|              | Before                               | After                              |
| ------------ | ------------------------------------ | ---------------------------------- |
| Sites list   | ![before](./before-sites-list.png)   | ![after](./after-sites-list.png)   |
| View options | ![before](./before-view-options.png) | ![after](./after-view-options.png) |
```

With after shots only, list them without a table.

Uploads are public and permanent. Shots from an E2E test account that passed step 4 are pre-approved, so upload them without asking; ask first for any other shot. Use the first route that works:

1. **`gh --attach`**, if `gh pr create --help | grep -q -- '--attach'`. Pass one `--attach ./<file>.png` per image to `gh pr create` or `gh pr edit`, run from `$OUT` so the paths resolve; `gh` uploads each file and rewrites its `./` reference to the uploaded URL. Afterwards, `gh pr view --json body --jq .body` must not contain `](./`.
2. **Minted URLs**, for an older `gh`, or for a review comment, which has no `--attach`. Upload each image without posting anything, then put the returned URL in the table:

   ```bash
   ID=$(gh api repos/Automattic/wp-calypso --jq .id)
   gh api -X POST "https://uploads.github.com/user-attachments/assets?name=after-sites-list.png&content_type=image/png&repository_id=$ID" \
   	-H 'Content-Type: application/octet-stream' --input "$OUT/after-sites-list.png" --jq .url
   ```

   A 404 means no write access; use the next route.

3. **Manual.** Give the user the PNG paths to drag into the PR description, and leave no `./` image links in it.

Never commit images to the repository to host them, and never post a comment just to get an upload URL and then delete it: it notifies everyone anyway.
