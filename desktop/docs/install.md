# Installing WordPress.com for Desktop

## Quick Summary of Steps

1.	Check that you have all prerequisites (Git, Node, NPM). See below for more details.
2. Create a /config/secrets.json file and fill it with [secrets](../secrets.md)
3. `make run` to build and run the app

## Prerequisites

To be able to clone the repo and run the application you need:

-	[Node.js](http://nodejs.org/) and [NPM](https://www.npmjs.com/) installed. Here's a [handy installer](https://nodejs.org/dist/latest/) for Windows, Mac, and Linux. On Mac OSX using [brew]() is the easiest way to install `node` and `npm`.
-	[Git](http://git-scm.com/). Try the `git` command from your terminal, if it's not found then use this [installer](http://git-scm.com/download/).
-	The repository also uses `make` to orchestrate compiling the JavaScript, running the server, and several other tasks. On Mac OSX, the easiest way to install `make` is through Apple's [Command Line Tools for Xcode](https://developer.apple.com/downloads/) (requires free registration).

## Installing and Running

Clone this git repo to your machine via the terminal using the `git clone` command and then run `make desktop-run` from the root app directory:

```bash
$ git clone git@github.com:Automattic/wp-calypso.git
$ cd wp-calypso
$ make desktop-run
```

The `make desktop-run` command will install any `npm` dependencies and start the development server.
