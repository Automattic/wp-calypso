# Building a Release

In order to run outside of the development environment you need to build a release version, which takes Electron, the app, and Calypso, and builds an 'executable' as well as installers appropriate for your platform. (Windows: NSIS installer, macOS: DMG image, Linux: Debian package)

To do this, run the following command:

```bash
make build
```

If you do not want to re-compile your code you can split the command into building the JavaScript source and application packaging.

```bash
# Creating the JS bundles, CSS files, ...
make source [CONFIG]

# Package the App
make package
```

**Notes:**

- `make build` will by default only create a distributable package for your current host system.
- All packages are saved to the `./release` directory.
- We are using CircleCI for creating release builds. For advanced configuration use cases please check the [`.circleci/config.yml`](../.circleci/config.yml)

## Customizing the build

### Desktop Configs

In [`desktop-config`](../desktop-config) you can find various configurations for building the app. The most used configurations are
`release`, `development` and `test`.

To use a specific configuration, run:

```bash
make build CONFIG_ENV=...
```

By default, we fall back to `base` if no configuration is specified.

## Platform Requirements

### Mac

A Mac build requires the app to be signed. This prevents a security warning being issued when you run the app. It is also a requirement of the auto-updater feature.

You can obtain all the appropriate signing certificates from an Apple Developer account.

Note that you need the certificates installed prior to building.

### Windows

Refer to Windows environment requires in the [development docs](./development.md).

### Linux

To build on Linux, you need the following libraries in order to be able to manually re-build native dependencies:

```
apt-get install -y libsecret-1-devdev
```
