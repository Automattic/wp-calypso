# WordPress.com for Desktop

WordPress.com for Desktop is an [Electron](https://github.com/atom/electron) wrapper for [Calypso](https://github.com/Automattic/wp-calypso), the WordPress.com front-end. It works on Mac, Windows, and Linux.

## Getting Started & Running Locally

The steps marked _Production\*_ can be omitted but should be taken when building the production version of the app.

1. Clone the Calypso repository locally
1. Install all root level dependencies with `yarn`
1. Export the environment variables:
   - _Production\*_: `CONFIG_ENV` (set to `release`)
   - _Production\*_: `CALYPSO_SECRETS_ENCRYPTION_KEY` (it's a secret!)
1. _Production\*_: `yarn run build-desktop:secrets`
1. Build the app with `yarn run build`
1. Find the built apps in the `desktop/release` folder

To disable the auto-updater when testing locally, make sure to export the `DEBUG` environment variable and invoke the Electron binary directly. For example on Mac:

```
export DEBUG='*'
./desktop/release/mac/WordPress.com.app/Contents/MacOS/WordPress.com
```

### Development Mode

For a quicker and more efficient development experience, the application can be run in "development mode", which executes the application code directly (i.e. without building the app). This development mode can be ran against production WordPress.com webapp, or a local instance of Calypso.

- First, create your config file with `yarn run build:config`
- Use `yarn run dev` to run development mode and load production WordPress.com, _OR_
- Boot Calpyso from the root of the Calypso repository with `yarn start`. Once Calypso is ready, the desktop app can be booted with `yarn run dev:localhost` to load the local instance of Calypso.

## Development

Refer to the [development guide](docs/development.md) for help with how the app works and how to change stuff.

## Running The End-To-End Test Suite

1. Set the environment variables `E2EUSERNAME` and `E2EPASSWORD`.
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
