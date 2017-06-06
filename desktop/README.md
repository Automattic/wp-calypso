# WordPress.com for Desktop

WordPress.com for Desktop is an [Electron](https://github.com/atom/electron) wrapper for [Calypso](https://github.com/Automattic/wp-calypso), the new WordPress.com front-end. It works on Mac, Windows, and Linux.

![WordPress.com for Desktop](https://en-blog.files.wordpress.com/2015/12/01-writing-with-dock.png?w=1150)

# Getting Started & Running Locally

1. Clone this repository locally
1. Update the Calypso submodule with:
 - `git submodule init`
 - `git submodule update`
1. Create a `calypso/config/secrets.json` file and fill it with [secrets](docs/secrets.md)
1. `make run` to build and run the app

Need more detailed instructions? [We have them.](docs/install.md)

# Development

The app is split between Electron code and Calypso code, and so the [development guide](docs/development.md) may help you find where to change stuff.

# Building a Release

While running the app locally in a development environment is great, you will eventually need to [build a release version](docs/release.md) you can share.

# Packaging a Release

The final stage takes a released version and [packages it in a platform specific way](docs/packaging.md). This is only necessary if you are going to distribute publicly.

# Contributing

If this sparks your interest don't hesitate to send a pull request, send a suggestion, file a bug, or just ask a question. Don't forget
to check out our [CONTRIBUTING](CONTRIBUTING.md) doc.

Do be aware that this repository is just for the WordPress.com desktop wrapper. If you have something to contribute for Calypso (the app that runs inside of the desktop wrapper and on WordPress.com) then please add it in the [Calypso](https://github.com/Automattic/wp-calypso) repository.

# Troubleshooting

If you have any problems running the app please see the [most common issues](docs/troubleshooting.md).

# License

WordPress.com for Desktop is licensed under [GNU General Public License v2 (or later)](LICENSE.md).
