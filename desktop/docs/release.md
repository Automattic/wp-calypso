# Building a Release

Running the app in your [development environment](development.md) uses the prebuilt Electron binary to run the app directly from the directory.

In order to run outside of the development environment you need to build a release version, which takes Electron, the app, and Calypso, and builds an 'executable' as well as installers appropriate for your platform. (Windows: NSIS installer, macOS: DMG image, Linux: Debian package)

To do this, run the following command:

```bash
make build
```

If you do not want to re-compile your code you can split the command into building the source files and packaging.

```bash
# Creating the JS bundles, CSS files, ...
make build-source [CONFIG]

# Package the App
make package [BUILD_PLATFORM]
```

**Notes:**
- `make build` will by default only create a distributable package for your current host system.
- All packages are saved in the `./release` directory.
- We are using CircleCI for creating release builds. For advanced configuration use cases please check the [`.circleci/config.yml`](../.circleci/config.yml)  

## Customizing the build

### Multiplatform build
`make build` can build for Windows, macOS and Linux. To do so add the target platform you want to build for by adding the `BUILD_PLATFORM` parameter.

```bash
make build BUILD_PLATFORM=wml
```

We are using [electron-builder](https://electron.build)s default values to modify the build target:
`w` = Windows, `m` = macOS, `l` = Linux

### Desktop Configs

In [`desktop-config`](../desktop-config) you can find various configurations for building the app. The most used configurations are
`release`, `development` and `test`.

To use a specific configuration, run:

```bash
make build CONFIG=release
```

By default, we fall back to `base` if no configuration is specified.

## Platform Requirements

You can build all three platforms on macOS. The macOS app however can't be built on any other platform than macOS as codesigning would not work. 
For native dependencies such as `node-spellchecker` we are using prebuilt binaries to avoid platform specific re-builds. This allows us to build e.g. the Windows App from macOS as well as Linux.

### Mac

A Mac build requires the app to be signed. This prevents a security warning being issued when you run the app. It is also a requirement of the auto-updater feature.

You can obtain all the appropriate signing certificates from an Apple Developer account.

Note that you need the certificates installed prior to building.

### Windows

You can create the Windows build using OS X, which is much easier since all the tools needed to run Calypso are already in place.


### Linux

To build on Linux, you need the following libraries in order to be able to manually re-build native dependencies:

```
apt install libx11-dev libxext-dev libxss-dev libxkbfile-dev
```
