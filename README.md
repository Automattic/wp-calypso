Calypso
=======

Calypso is a web application that allows users to manage all of their WordPress blogs in one place. Calypso is Open Source software licensed under [GNU General Public License v2 (or later)](./LICENSE.md).

Making Changes
--------------

Our workflow is different &mdash; before jumping in and writing thousands of lines of code, you should read the [Contributing to Calypso](CONTRIBUTING.md) document. It describes the process that we're using. Understanding and following that procedure will save you a bunch of pain down the road. :grinning:

Getting Started
---------------

1.	Check the prerequisites are installed (Git, Node, NPM). See below for more details.
2.	Clone this repository locally.
3.	Add `127.0.0.1 calypso.localhost` to your local hosts file.
4.	With the command line open at the repository root, execute `make run`. See below for more details.
5.	Open `calypso.localhost:3000` in your browser.

### Prerequisites

To be able to clone and run the application you need:

-	[Node.js](http://nodejs.org/) and [NPM](https://www.npmjs.com/) installed. Here's a [handy installer](https://nodejs.org/dist/latest/) for Windows, Mac, and Linux.
-	[Git](http://git-scm.com/). Try the `git` command from your terminal, if it's not found then use this [installer](http://git-scm.com/download/).
-	The repository also uses `make` to orchestrate compiling the JavaScript, running the server, and several other tasks.

### Installing and Running

Clone this git repo to your machine via the terminal using the `git clone` command and then run `make` from the root calypso directory:

```bash
$ git clone git@github.com:Automattic/calypso-pre-oss.git
$ cd calypso-pre-oss
$ make run
```

The `make run` command will install any node dependencies and start the application. When changes are made to either the JavaScript files or the Sass stylesheets, the build process will run when making a request to the application via the browser. The build process compiles both the JavaScript and CSS to make sure that you have the latest versions of both.

To run Calypso locally, you'll need to add `127.0.0.1 calypso.localhost` to your hosts file, and load the app at http://calypso.localhost:3000 instead of localhost. This is necessary because only certain origins are allowed to make use of the REST API via the iframe proxy.

Our Approach
------------

After evaluating several JavaScript libraries and frameworks designed to make creating single-page apps easier, we decided to forego a monolithic framework altogether and build our own system with the help of small open source modules made available via [npm](https://www.npmjs.com/). Significantly we have chosen to use [React](http://facebook.github.io/react/) for the view layer, and have been heavily influenced by the React community.

Coding Guidelines
-----------------

[Coding Guidelines »](docs/coding-guidelines.md)

I18n Guidelines
---------------

[I18n Guidelines »](client/lib/mixins/i18n/README.md)

Browser Support
---------------

We support the latest two versions of all major browsers (see [browse happy](http://browsehappy.com) for current latest versions).

Directory Structure
-------------------

Since we're using [Node.js](http://nodejs.org) on the server, there is going to be a lot of JavaScript code in the application. This only gets compounded by the fact that both server-side and client-side modules reside on the same `npm` package manager (though that ends up being a net positive due to reusability and discovery).

The structure of the project is as follows:

```
├── README.md
├── index.js
├── package.json
├── Makefile
├── assets
│   └── stylesheets
├── client
│   ├── boot
│   ├── config
│   └── … more modules
├── config
│   ├── client.json
│   ├── development.json
│   └── production.json
├── server
│   ├── boot
│   ├── config
│   └── … more modules
└── public
    ├── index.html
    ├── build.js
    ├── build.css
    └── … more static files
```

Let's explain the main directories individually:

#### `config`

This dir is used to store `.json` config files. At boot-up time, the server decides which config file to use based on the `CALYPSO_ENV` environment variable variable. The default value is `"development"`.

To run calypso use a value other than the default, you can specify the value in the command:

```bash
CALYPSO_ENV=wpcalypso make run
```

One of the main uses of the config, is to enable/disable features for different environments. This allows us to merge early and often.

See the main config [README](config/README.md) for more information.

#### `assets`

This directory contains the [Sass](http://sass-lang.com/) stylesheets that are compiled into a single style.css when `make build` runs.

#### `server`

This dir contains all server-side logic, in self-contained modules within this directory. There should be no other files in this directory other than directories of self-contained modules. The server entry point is usually the `boot` module, which should be a function that returns a "http request handler" function (with the `function (req, res) {}` signature), like the one returned from Express.

#### `client`

This dir is similar in structure to the `server` dir, except that this JavaScript code ends up running on the client-side.

Similar to the `server` dir, the client should have a `boot` module that is the entry point to the client-side application. Often times this file uses [page.js](http://visionmedia.github.io/page.js) to set up the client-side routes, which makes for nice symmetry with the server-side.

#### `public`

This dir contains static assets to be served via the sever-side static provider (Express.js' `static()` middleware since we're being particular). The default Makefile setup ends up compiling:

-	`build-[environment].[hash].js` - webpack bundle of the client-side application.
-	`build-logged-out-[environment].[hash].js` - webpack bundle of the logged-out client-side application.
-	`[section].[hash].js` - webpack chunk for each section in `sections.js`.
-	`style.css` - the compiled `*.scss` SASS files concat'd into a single CSS file.

Of course, any other static assets may be dropped into this directory as well (web font files, icon packs, the favicon, images, etc.).

Debugging
---------

Calypso uses the [debug](https://github.com/visionmedia/debug) module to handle debug messaging. To turn on debug mode for all modules, type the following in the browser console:

```js
localStorage.setItem( 'debug', '*' );
```

You can also limit the debugging to a particular scope

```js
localStorage.setItem( 'debug', 'calypso:*' );
```

The Node server uses the DEBUG environment variable instead of localStorage. `make run` will pass along it's environment, so you can turn on all debug messages with

```bash
DEBUG=* make run
```

or limit it as before with

```base
DEBUG=calypso:* make run
```
