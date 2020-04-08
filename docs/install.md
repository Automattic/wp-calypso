# Installing Calypso

You can install Calypso directly on your machine by following the next steps, or use a [portable development environment](install.md#using-a-portable-development-environment):

## Quick Summary of Steps

1.	Check that you have all prerequisites (Git, Node, NPM). See [below](install.md#prerequisites) for more details. Pay close attention to software versions.
2.	Clone this repository locally.
3.	Add `127.0.0.1 calypso.localhost` to your local `hosts` file.
4.	Execute `yarn start` from the root directory of the repository.
5.	Open [`calypso.localhost:3000`](http://calypso.localhost:3000/) in your browser.

## Prerequisites

To be able to clone the repository and run the application you need:

-	Install the [Node.js](http://nodejs.org/) and matching [NPM](https://www.npmjs.com/) [versions](https://nodejs.org/en/download/releases/) listed in the `"engines"` section of [package.json](https://github.com/Automattic/wp-calypso/blob/master/package.json) **(this bit about versions is important, that's why I'm using bold)**. On Mac OS X and Linux using [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n) makes it easy to manage `node` versions. On Windows you may want to try [nvm-windows](https://github.com/coreybutler/nvm-windows) or [nodist](https://github.com/marcelklehr/nodist).
-	Please note that in Debian/Ubuntu versions of Linux, `node` command is renamed to `nodejs`. This will cause Calypso to fail during installation. Follow the instructions [here](https://stackoverflow.com/a/18130296) to create a symlink to `node`.
-	[Git](http://git-scm.com/). Try the `git` command from your terminal, if it's not found then use this [installer](http://git-scm.com/download/).

## Installing and Running

Clone this git repository to your machine via the terminal using the `git clone` command and then run `yarn start` from the root Calypso directory:

```bash
$ git clone https://github.com/Automattic/wp-calypso.git
$ cd wp-calypso
$ yarn start
```

_Note - if you are planning on pushing changes back to Calypso, this workflow will ask you for a username and password every time you push a change, which will not work if you have GitHub 2-factor auth enabled.  In this case you should use `git clone git@github.com:Automattic/wp-calypso.git` instead, and follow the instructions [here](https://help.github.com/articles/about-ssh/) to set up authentication._

The `yarn start` command will install any `npm` dependencies and start the development server. When changes are made to either the JavaScript files or the Sass stylesheets, the build process will run automatically. The build process compiles both the JavaScript and CSS to make sure that you have the latest versions of both.

To run Calypso locally, you'll need to add `127.0.0.1 calypso.localhost` to [your hosts file](http://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/), and load the app at [http://calypso.localhost:3000](http://calypso.localhost:3000) instead of just `localhost`. This is necessary, because when running locally Calypso is using the remote version of the WordPress.com REST API, which allows only certain origins via our current authentication methods.

If your browser is set to block 3rd-party cookies, you should set an exception on `https://public-api.wordpress.com` in order for Calypso to work correctly on the said origin.

See [Development Workflow](../docs/development-workflow.md) for more.

### Limited builds

Calypso is [broken up into sections](https://github.com/Automattic/wp-calypso/blob/master/client/sections.js) and by default, every section is built when the development server starts.
This can take a long time and slow down incremental builds as your work. To speed things up,
you can choose to build and run specific sections of Calypso using the `SECTION_LIMIT` environment variable.

For instance, `SECTION_LIMIT=reader,login yarn start` would start Calypso and only build the `reader` and `login` sections.

To find all available sections in the main entry point, you can refer to the [sections.js file](https://github.com/Automattic/wp-calypso/blob/master/client/sections.js). Note that the other entry points are likely to register and handle additional sections.

Additionally, in Calypso, we use multiple [Webpack entry points](https://webpack.js.org/concepts/entry-points/) for separating concerns and serving smaller bundles to the user at any given time.
Building a limited number of entry points speeds up the build process, and to allow that, the `ENTRY_LIMIT` environment variable is available to allow building and running only a specific entry point.

For example: `ENTRY_LIMIT=entry-login,entry-main npm start` would start Calypso and only build the login and the main entry points.

To find all available entry points, you can refer to the `entry` option in Calypso's primary `webpack.config.js` file.

### Starting the node debugger

The `yarn start` command will pass anything set in the `NODE_ARGS` environment variable as an option to the Node command.  This means that if you want to start up the debugger on a specific port you can run `NODE_ARGS="--debug=5858" yarn start`.  Starting the built-in inspector can also be done by running `NODE_ARGS="--inspect" yarn start`.  In either case, if you would like to debug the build process as well, it might be convenient to have the inspector break on the first line and wait for you.  In that case, you should also pass in the `--debug-brk` option like so `NODE_ARGS="--inspect --debug-brk" yarn start`.

## Using a portable development environment

You can install Calypso very quickly via a portable development environment called [Calypso Bootstrap](https://github.com/Automattic/wp-calypso-bootstrap). It uses Vagrant and Puppet behind the scenes to install and configure a virtual machine with Calypso ready to run - with a single command.
