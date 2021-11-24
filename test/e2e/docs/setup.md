# Advanced Setup

Follow the [Quick Start](../README.md) guide to install required software.

## Table of contents

<!-- TOC -->

- [Advanced Setup](#advanced-setup)
    - [Table of contents](#table-of-contents)
    - [Apple Silicon emulated x86_64](#apple-silicon-emulated-x86_64)
    - [Apple Silicon arm64](#apple-silicon-arm64)
    - [Help](#help)
        - [The chromium binary is not available for arm64](#the-chromium-binary-is-not-available-for-arm64)

<!-- /TOC -->

## Apple Silicon (emulated x86_64)

1. install i386 Homebrew:

```
arch -x86_64 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

2. install `nvm` using i386 Homebrew:

```
arch -x86_64 /usr/local/bin/brew install nvm
```

**This is critical! If nvm is installed using ARM64 Homebrew, installed Node versions will also be the ARM64 variant and nothing will work!**

3. using `nvm`, install the current version of NodeJS used in `wp-calypso`:

```
nvm install <node_version>
```

4. instruct `nvm` to use the version of NodeJS installed in previous step:

```
nvm use <node_version>
```

5. update `npm` version:

```
arch -x86_64 npm install -g npm@latest
```

6. install `yarn`:

```
arch -x86_64 npm install yarn
```

7. install all dependencies from repo root:

```
arch -x86_64 yarn install --frozen-lockfile
```

8. verify that mocha can run under `test/e2e/` directory:

```
./test/e2e/node_modules/.bin/mocha
```

At any point, run `arch` to verify whether shell is running with Rosetta 2 emulation.

## Apple Silicon (arm64)

Similar to instructions in macOS Intel architecture, install the arm64 variant of the required software, then follow these steps:

1. export required environment variables:

```
PUPPETEER_SKIP_DOWNLOAD=true
CHROMEDRIVER_SKIP_DOWNLOAD=true
```

2. install dependencies:

```
yarn install
```


## Help

### The chromium binary is not available for arm64

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

