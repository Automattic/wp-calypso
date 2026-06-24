# wpcom-smart-dictation

Webpack build that registers a **Gutenberg editor plugin** (“WP.com Smart Dictation”) with a sidebar powered by [`@automattic/wpcom-smart-dictation`](../../packages/wpcom-smart-dictation). Output is deployed for use on WordPress.com (see `package.json` `dev` script `remotePath`).

## Development

From this directory:

```bash
yarn dev    # build and sync via calypso-apps-builder (see package.json)
yarn build  # production build
```

UI and behavior live in the package; this app is the editor entry and bundle.
