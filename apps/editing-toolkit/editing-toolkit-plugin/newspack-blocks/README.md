# Newspack Blocks

Some of the Newspack blocks were added to this repository in order to make it available to other parts of the FSE plugin, such as Starter Page Templates where these blocks will be used.

## Block Posts Block

This block allows you to list your posts in various layouts and filter them by criteria like category, tag or author.

It originally comes from the [Newspack Blocks collection](https://github.com/automattic/newspack-blocks) and the block is still being developed there.

## Post Carousel Block

This block allows you to create a carousel of post's featured images and filter them by criteria like category, tag or author.

It originally comes from the [Newspack Blocks collection](https://github.com/automattic/newspack-blocks) and the block is still being developed there.

## Structure

```
index.php — main entry file, registers the blocks on backend
blog-posts-block-editor.min.js — assets for the blog-posts-block editor
blog-posts-block-view.min.js — assets for the blog-posts-block rendered on frontend
carousel-block-editor.min.js — assets for the carousel-block editor
carousel-block-view.min.js — assets for the carousel-block rendered on frontend
synced-newspack-blocks/** — source code synced from the Newspack Blocks repository, not tracked in Calypso git repo
```

`blog-posts-block-editor.min.js`, `blog-posts-block-view.min.js`, `carousel-block-editor.min.js`, `carousel-block-view.min.js` and `index.php` are files written in order to bridge the parent plugin with the Newspack Blocks. It changes the block names to an `a8c/` namespace and does things like registering REST fields or styles and scripts. In these files we are free to do all those changes because they are not shared with Newspack and only live here in this repository.

### Synchronizing the code

You can see that `synced-newspack-blocks` is being synced with the Newspack Blocks repository. Please make all improvements and additions on the Newspack side. Please don't make any direct changes to files in this directory as the next synchronization will overwrite them. Synced files are not being tracked in git and they are always downloaded fresh using the sync script explained further in this document.

Once your changes land on the Newspack side, coordinate with the team (over issues/PRs) to [make a new release](https://github.com/Automattic/newspack-blocks/releases) and once you have the release ID, you can pull the code into here.

While being in `apps/editing-toolkit/` directory, you can run:

```
yarn run sync:newspack-blocks --release=1.0.0-alpha.17
```

This will pull the code from the release and integrate it into this repository. Please review changes, make sure to update `NEWSPACK_BLOCKS__VERSION` in [index.php](./index.php) and commit.

### Local development

Sometimes, probably, you will need to sync the NHA code straight in your local environment. It means you will get working on both projects at the same time. For this situation, you'd like to reference the code source through the `path` bin script argument.

```
yarn run sync:newspack-blocks --path=/Absolute/path/of/newspack-blocks/
```
