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

`editor.js`, `view.js` and `index.php` are files written in order to bridge the parent plugin with the Blog Posts Block. It changes the block name to `a8c/blog-posts` and does things like registering REST fields or styles and scripts. In these files we are free to do all those changes because they are not shared with Newspack and only live here in this repository.

### Synchronizing the code

You can see that `newspack-homepage-articles` is being synced with the Newspack Blocks repository. Please make all improvements and additions on the Newspack side. Please don't make any direct changes to files in this directory as the next synchronization will overwrite them.

Once your changes land on the Newspack side, coordinate with the team (over issues/PRs) to [make a new release](https://github.com/Automattic/newspack-blocks/releases) and once you have the release ID, you can pull the code into here.

While being in `apps/full-site-editing/` directory, you can run:

```
yarn run sync:blog-posts-block --release=1.0.0-alpha.17
```

This will pull the code from the release and integrate it into this repository. Please review changes, make sure to update `NEWSPACK_BLOCKS__VERSION` in [index.php](./index.php) and commit.

### Local development

Sometimes, probably, you will need to sync the NHA code straight in your local environment. It means you will get working on both projects at the same time. For this situation, you'd like to reference the code source through the `path` bin script argument.

```js
yarn run sync:blog-posts-block --path=/Absolute/path/of/newspack-blocks/
```
