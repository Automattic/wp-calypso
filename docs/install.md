# Installing Calypso

You can install Calypso directly on your machine by following the next steps, or use a [portable development environment](install.md#using-a-portable-development-environment):

## Quick Summary of Steps

1.	Check that you have all prerequisites (Git, Node, NPM). See [below](install.md#prerequisites) for more details.
2.	Clone this repository locally.
3.	Add `127.0.0.1 calypso.localhost` to your local `hosts` file.
4.	Execute `npm start` or `npm run dashboard` (for a more visually-oriented interface) from the root directory of the repository.
5.	Open [`calypso.localhost:3000`](http://calypso.localhost:3000/) in your browser.

## Prerequisites

**On Mac OS X or Linux**, to be able to clone the repository and run the application you need:

-	Install the [Node.js](http://nodejs.org/) and matching [NPM](https://www.npmjs.com/) [versions](https://nodejs.org/en/download/releases/) listed in the engines section of [package.json](https://github.com/Automattic/wp-calypso/blob/master/package.json). On Mac OS X using [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n) makes it easy to manage `node` versions.
-	[Git](http://git-scm.com/). Try the `git` command from your terminal, if it's not found then use this [installer](http://git-scm.com/download/).

## Installing and Running

Clone this git repository to your machine via the terminal using the `git clone` command and then run `npm start` from the root Calypso directory:

```bash
$ git clone https://github.com/Automattic/wp-calypso.git
$ cd wp-calypso
$ npm start
```

The `npm start` command will install any `npm` dependencies and start the development server. When changes are made to either the JavaScript files or the Sass stylesheets, the build process will run automatically. The build process compiles both the JavaScript and CSS to make sure that you have the latest versions of both.

To run Calypso locally, you'll need to add `127.0.0.1 calypso.localhost` to [your hosts file](http://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/), and load the app at [http://calypso.localhost:3000](http://calypso.localhost:3000) instead of just `localhost`. This is necessary, because when running locally Calypso is using the remote version of the WordPress.com REST API, which allows only certain origins via our current authentication methods.

See [Development Workflow](../docs/development-workflow.md) for more.

## Using a portable development environment

You can install Calypso very quickly via a portable development environment called [Calypso Bootstrap](https://github.com/Automattic/wp-calypso-bootstrap). It uses Vagrant and Puppet behind the scenes to install and configure a virtual machine with Calypso ready to run - with a single command.
