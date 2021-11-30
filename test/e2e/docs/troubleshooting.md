# Troubleshooting & Debugging

<!-- TOC -->

- [Troubleshooting & Debugging](#troubleshooting--debugging)
    - [git pre-commit hook/husky](#git-pre-commit-hookhusky)
    - [Chromium binary is not available for arm64](#chromium-binary-is-not-available-for-arm64)
    - [Package 'lcms2', required by 'vips', not found](#package-lcms2-required-by-vips-not-found)

<!-- /TOC -->

## git pre-commit hook/husky

If running `git commit` shows the following:

```
husky > pre-commit (<node_version>)
error Command "install-if-no-packages" not found.
husky > pre-commit hook failed (add --no-verify to bypass)
```

Solution:

1. remove all instances of `node_module` folder (if present):

```
cd <repo_root>test/e2e
find . -name 'node_modules' type -d -prune
rm -rf node_modules
```

2. return to the <repo_root> and install all dependencies from there:

```
yarn install
```

Once complete, running `git commit` should no longer trigger the git pre-commit hook error.

## Chromium binary is not available for arm64

Problem:

```
The chromium binary is not available for arm64:
If you are on Ubuntu, you can install with:

 apt-get install chromium-browser

/Calypso/wp-calypso/node_modules/backstopjs/node_modules/puppeteer/lib/cjs/puppeteer/node/BrowserFetcher.js:112
            throw new Error();
            ^

Error
    at /Calypso/wp-calypso/node_modules/backstopjs/node_modules/puppeteer/lib/cjs/puppeteer/node/BrowserFetcher.js:112:19
    at FSReqCallback.oncomplete (node:fs:198:21)

```

Solution:

```
PUPPETEER_SKIP_DOWNLOAD=true
CHROMEDRIVER_SKIP_DOWNLOAD=true
```

Description:
This issue occurs for Apple Silicon users. At the time of writing, the version of Puppeteer used in `wp-calypso` pre-dates Apple Silicon.

This issue should go away once Puppeteer version is bumped to an Apple Silicon-compatible version.

## Package 'lcms2', required by 'vips', not found

This issue is observed by Apple Silicon users when attempting to set up Calypso locally.

```
Package 'lcms2', required by 'vips', not found
gyp: Call to 'PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:/usr/lib/pkgconfig" pkg-config --cflags-only-I vips-cpp vips glib-2.0 | sed s\/-I//g' returned exit status 0 while in binding.gyp. while trying to load binding.gyp
gyp ERR! configure error
gyp ERR! stack Error: `gyp` failed with exit code: 1
gyp ERR! stack     at ChildProcess.onCpExit (/Users/keoshi/Documents/repos/wp-calypso/node_modules/node-gyp/lib/configure.js:353:16)
gyp ERR! stack     at ChildProcess.emit (node:events:390:28)
gyp ERR! stack     at Process.ChildProcess._handle.onexit (node:internal/child_process:290:12)
gyp ERR! System Darwin 21.1.0
gyp ERR! command "/Users/keoshi/.nvm/versions/node/v16.11.1/bin/node" "/Users/keoshi/Documents/repos/wp-calypso/node_modules/node-gyp/bin/node-gyp.js" "rebuild"
gyp ERR! cwd /Users/keoshi/Documents/repos/wp-calypso/node_modules/sharp
```

Solution:

Comment out the dependency for `sharp` in the [top-level `package.json`](https://github.com/Automattic/wp-calypso/blob/trunk/package.json#L276).
