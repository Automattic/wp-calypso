# WordPress.com for Desktop

WordPress.com for Desktop is an [Electron](https://github.com/atom/electron) wrapper for [Calypso](https://github.com/Automattic/wp-calypso), the WordPress.com front-end. It works on Mac, Windows, and Linux.

## Getting Started & Running Locally

The steps marked _Production\*_ can be omitted but should be taken when building the production version of the app.

1. Clone the Calypso repository locally
1. Install all root level dependencies with `yarn`
1. Export the environment variables:
   - _Production\*_: `CONFIG_ENV` (set to `release`)
1. Build the app with `yarn run build`
1. Find the built apps in the `desktop/release` folder

To disable the auto-updater when testing locally, make sure to export the `DEBUG` environment variable and invoke the Electron binary directly. For example on Mac:

```
export DEBUG='*'
./desktop/release/mac/WordPress.com.app/Contents/MacOS/WordPress.com
```

### Development Mode

For a quicker and more efficient development experience, the application can be run in "development mode", which executes the application code directly (i.e. without building the app). This development mode can be ran against production WordPress.com webapp, or a local instance of Calypso.

Run `yarn run build:config` from the `desktop/` directory first. To develop against the hosted WordPress.com app, run `yarn run dev` there.

To run Desktop against local Calypso, use **`http://calypso.localhost:3000`** for sign-in. Worktrees pick their own ports by default, so set `PORT=3000` explicitly:

1. From the repository root, start Calypso with `PORT=3000 yarn start`.
2. Once Calypso is ready, open a separate terminal and run `PORT=3000 yarn run dev:localhost` from `desktop/`.

On Windows, start Calypso in WSL. In PowerShell, set `$env:PORT = '3000'` before running `yarn run dev:localhost`.

## Development

Refer to the [development guide](docs/development.md) for help with how the app works and how to change stuff.

## Running The End-To-End Test Suite

1. Set the environment variables `WP_DESKTOP_E2E_USERNAME` and `WP_DESKTOP_E2E_PASSWORD`.
2. Use `yarn run test:e2e` or `make e2e` to invoke the test suite.

To manually start each platform's _pre-packaged_ executable used for end-to-end testing:

- Mac: Double-click `WordPress.com.app` (extract with [`ditto`](<##Extracting-Published-ZIP-Archive-in-MacOS-10.15-(Catalina)>))
- Windows: Double-click WordPress.com.exe in `win-unpacked` directory
- Linux: `npx electron /path/to/linux-unpacked/resources/app`

## MacOS Notarization

Notes on MacOS notarization can be found [here](docs/notarization.md).

## Building & Packaging a Release

While running the app locally in a development environment is great, you will eventually need to [build a release version](docs/release.md) you can share.

## Troubleshooting

If you have any problems running the app please see the [most common issues](docs/troubleshooting.md).

## License

WordPress.com for Desktop is licensed under [GNU General Public License v2 (or later)](LICENSE.md).
