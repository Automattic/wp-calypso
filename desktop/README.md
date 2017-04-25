# WordPress.com for Desktop

WordPress.com for Desktop is an [Electron](https://github.com/atom/electron) wrapper for Calypso, allowing WordPress.com to be installed and run as a dedicated app for Mac, Windows, and Linux.

![WordPress.com for Desktop](https://en-blog.files.wordpress.com/2015/12/01-writing-with-dock.png?w=1150)

# Getting Started & Running Locally

1. [Clone & install](../docs/install.md) this repository locally
1. Create a `config/secrets.json` file and fill it with [secrets](docs/secrets.md)
1. `make desktop-run` to build and run the desktop app

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

Copyright (C) 2015 by its contributors.

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

WordPress.com for Desktop is licensed under [GNU General Public License v2 (or later)](../LICENSE.md).
