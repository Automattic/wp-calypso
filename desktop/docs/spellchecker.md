
# Setting up Spellchecker

The spellchecker used is the [node-spellchecker][1] module which is a native
module that needs to be built for each platform. It is relatively straight
forward to build, however requires having a build enviornment setup for each
platform.

So to simplify this, we zip up the built binaries and upload to the `gh-pages`
branch which is then downloaded and binds when creating a release package, so
anyone creating a release doesn't need an enviornment only on major upgrades to
Electron and/or Spellcheck library.

The build process is to run `npm install`, which should run the
appropriate `node-gyp` commands and create the build in
`node_modules/spellchecker/build/Release` directory.

This is what we zip up for each platform and upload the zip to Github.

The binding for each platform should be updated to refer to the new zip,
[darwin.js][2], [linux.js][3], [win32.js][4]



## Building on Windows

OS X and Linux are pretty straight forward, since most of the pre-requisites are
already setup and works.

On Windows, you will need to install Python 2.7.x along with Node and Git, I've
found the Github shell is easiest to work in. Be sure to include python.exe in
your PATH.

Additionally, you will need Microsoft Visual C++ tools installed, which I found easiest
to do installing [Visual Studio 2013 SDK][5] and selecting the libraries in the installer.


[1]: https://github.com/atom/node-spellchecker
[2]: https://github.com/Automattic/wp-desktop/blob/master/resource/platform/darwin.js#L58
[3]: https://github.com/Automattic/wp-desktop/blob/master/resource/platform/linux.js#L35
[4]: https://github.com/Automattic/wp-desktop/blob/master/resource/platform/win32.js
[5]: https://www.microsoft.com/en-US/download/details.aspx?id=44914
