# Packaging a Release

Some builds require further packaging before they can be released:

* `make package-win32` - Produces a signed `Setup.exe` install wizard
* `make package-osx` - Produces a `DMG` file
* `make package-linux` - Produces a `.deb` file

## Requirements

### Windows Package

The Windows package requires installing a valid certificate, [see Code Signing a Windows Application][2] and will also requiring installing the `makensis` and `mono` packages, installable from `brew`.

### Linux Package

The Linux package is build using [FPM][1] which is a tool that makes it easy to build different package systems. FPM can be installed using `gem install fpm`, you will likely need to install a better ruby and gnu-tar than what ships with OS X. `brew install ruby gnu-tar`

[1]: https://github.com/jordansissel/fpm
[2]: https://mkaz.tech/code-signing-a-windows-application.html
