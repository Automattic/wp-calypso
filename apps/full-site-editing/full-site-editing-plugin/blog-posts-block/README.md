# Blog Posts Block

This block allows you to list your posts in various layouts and filter them by criteria like category, tag or author.

It originally comes from the [Newspack Blocks collection](https://github.com/automattic/newspack-blocks) and the block is still being developed there.

It was added to this repository in order to make it available to other parts of the FSE plugin, such as Starter Page Templates where this block will be used.

## Structure

```
index.php — main entry file, registers the block on backend
editor.js — assets for the block editor
view.js — assets for the block rendered on frontend
newspack-homepage-articles/** — source code synced from the Newspack Blocks repository
```

### Synchronizing the code

You can see that `newspack-homepage-articles` is being synced with the Newspack Blocks repository. Please make all improvements and additions on the Newspack side. Please don't make any direct changes to files in this directory as the next synchronization will overwrite them.

Once your changes land on the Newspack side, coordinate with the team (over issues/PRs) to [make a new release](https://github.com/Automattic/newspack-blocks/releases) and once you have the release ID, you can pull the code into here.

While being in `apps/full-site-editing/` directory, you can run:

```
npm run sync:blog-posts-block --release=1.0.0-alpha.17
```

This will pull the code from the release and integrate it into this repository. Please review changes, make sure to update `NEWSPACK_BLOCKS__VERSION` in [index.php](./index.php) and commit.
