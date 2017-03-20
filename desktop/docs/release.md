# Building a Release

Running the app in your development environment uses the prebuilt Electron binary to run the app directly from the directory.

In order to run outside of the development environment you need to build a release version, which takes Electron, the app, and Calypso, and builds an 'executable' appropriate for your platform.

To do this, run one of the following commands:

* `make osx`
* `make linux`
* `make win32`

Note: all packages are saved in the `release` directory.

## Platform Requirements

### Mac

A Mac build requires the app to be signed. This prevents a security warning being issued when you run the app. It is also a requirement of the auto-updater feature.

You can obtain all the appropriate signing certificates from an Apple Developer account.

Note that you need the certificates installed prior to building.

### Windows

You can create the Windows build using OS X, which is much easier since all the tools needed to run Calypso are already in place. You need two packages:

`brew install wine makensis`

The Windows build doesn't get signed until the packaging stage, to sign you can [see the directions here](https://mkaz.wordpress.com/2015/12/09/code-signing-a-windows-application/).

### Linux

To build the Debian package for Linux, we use the [FPM tool](https://github.com/jordansissel/fpm/wiki) which is a Ruby library that makes building packages a little easier. The Linux package is also built on OS X, to install the prerequisites:

```
brew install ruby
sudo gem install fpm
```
