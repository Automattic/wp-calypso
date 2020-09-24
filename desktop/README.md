# WordPress.com for Desktop

WordPress.com for Desktop is an [Electron](https://github.com/atom/electron) wrapper for [Calypso](https://github.com/Automattic/wp-calypso), the WordPress.com front-end. It works on Mac, Windows, and Linux.

![WordPress.com for Desktop](https://en-blog.files.wordpress.com/2015/12/01-writing-with-dock.png?w=1150)

# Getting Started & Running Locally

1. Clone the Calypso repository locally
1. Install all root level dependencies with `yarn` or `yarn install --frozen-lockfile`
1. Create `./config/secrets.json` file and fill it with [secrets](docs/secrets.md)
1. Build the app with `yarn run build-desktop`
1. Find the built apps in the `desktop/release`

Need more detailed instructions? [We have them.](docs/install.md)

# Development

Refer to the [development guide](docs/development.md) for help with how the app works and how to change stuff.

# Running The End-To-End Test Suite

1. Set the environment variables `E2EUSERNAME` and `E2EPASSWORD`.
2. Use `npm run e2e` or `make e2e` to invoke the test suite.

To manually start each platform's _pre-packaged_ executable used for end-to-end testing:

- Mac: Double-click `WordPress.com.app` (extract with [`ditto`](##Extracting-Published-ZIP-Archive-in-MacOS-10.15-(Catalina)))
- Windows: Double-click WordPress.com.exe in `win-unpacked` directory
- Linux: `npx electron /path/to/linux-unpacked/resources/app`

# MacOS Notarization

Notes on MacOS notarization can be found [here](docs/notarization.md).

# Building & Packaging a Release

While running the app locally in a development environment is great, you will eventually need to [build a release version](docs/release.md) you can share.

# Troubleshooting

If you have any problems running the app please see the [most common issues](docs/troubleshooting.md).

# License

WordPress.com for Desktop is licensed under [GNU General Public License v2 (or later)](LICENSE.md).
