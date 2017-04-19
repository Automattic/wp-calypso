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

The desktop app is split between Electron code and Calypso code.
We've put together a desktop-specific [development guide](docs/development.md) to give a walkthrough of how each of the pieces slot together and how to develop and debug the app.

# Building a Release

While running the app locally in a development environment is great, you will eventually need to [build a release version](docs/release.md) you can share.

# Packaging a Release

The final stage takes a released version and [packages it in a platform specific way](docs/packaging.md). This is only necessary if you are going to distribute publicly.

# Troubleshooting

If you have any problems running the desktop app please see the [most common issues](docs/troubleshooting.md).

# License

WordPress.com for Desktop is licensed under [GNU General Public License v2 (or later)](LICENSE.md).
