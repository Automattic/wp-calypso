# Installing Calypso

## Quick Summary of Steps

1.	Check that you have all prerequisites (Git, Node, NPM). See below for more details.
2.	Clone this repository locally.
3.	Add `127.0.0.1 calypso.localhost` to your local hosts file.
4.	Execute `make run` from the directory of the repository.
5.	Open `calypso.localhost:3000` in your browser.

## Prerequisites

To be able to clone the repo and run the application you need:

-	[Node.js](http://nodejs.org/) and [NPM](https://www.npmjs.com/) installed. Here's a [handy installer](https://nodejs.org/dist/latest/) for Windows, Mac, and Linux. On Mac OSX using [brew]() is the easiest way to install `node` and `npm`.
-	[Git](http://git-scm.com/). Try the `git` command from your terminal, if it's not found then use this [installer](http://git-scm.com/download/).
-	The repository also uses `make` to orchestrate compiling the JavaScript, running the server, and several other tasks. On Mac OSX, the easiest way to install `make` is through Apple's [Command Line Tools for Xcode](https://developer.apple.com/downloads/) (requires free registration).

## Installing and Running

Clone this git repo to your machine via the terminal using the `git clone` command and then run `make run` from the root Calypso directory:

```bash
$ git clone git@github.com:Automattic/wp-calypso.git
$ cd wp-calypso
$ make run
```

The `make run` command will install any `npm` dependencies and start the development server. When changes are made to either the JavaScript files or the Sass stylesheets, the build process will run automatically. In some cases it will even automatically reload the code in the browser (for React components code). The build process compiles both the JavaScript and CSS to make sure that you have the latest versions of both.

To run Calypso locally, you'll need to add `127.0.0.1 calypso.localhost` to [your hosts file](http://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/), and load the app at [http://calypso.localhost:3000](http://calypso.localhost:3000) instead of just `localhost`. This is necessary, because when running locally Calypso is using the remote version of the WordPress.com REST API, which allows only certain origins via our current authentication methods.
