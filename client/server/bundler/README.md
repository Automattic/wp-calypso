Bundler
=======

This module contains the code for generating the JavaScript files that are sent to the browser. The code leverages [webpack](http://webpack.github.io/), [uglifyjs](http://lisperator.net/uglifyjs/), and the sections module at `client/sections.js` that defines the various sections of the application.

### Glossary

__Code Splitting__ - [Code splitting](https://webpack.js.org/guides/code-splitting) is the term that webpack uses to describe the process of splitting the dependency graph for the application into chunks. Assets (JavaScript files) are then created for the chunks and loaded as part of the initial HTML request via `<script />` tags if the chunk is created as a section and asynchronously via `require.ensure` calls.

__File Watching__ - File watching is the process by which files are monitered for changes. If a file changes, the JavaScript assets are regenerated.

__Section__ - A set of related URL routes in Calypso that have a shared entrypoint. The entrypoint is a JavaScript module (usually `index.js`) in `client` that includes the code for registering one or more `page.js` routes and is the top of the dependency tree for the chunk.

__Router__ - The library that manages parsing the URL and calling code when the URL changes. The `page` npm package is used for client-side routing (using HTML5 History API) and `express` is used on the server. The two routers are similar in terms of how they work, but not identical.

__Webpack loader__ - A loader is a webpack extension that transforms code from one form into another. Multiple loaders can process the same module. The configuration of the loaders is specified in the webpack config file `webpack.config.js`.

__Webpack plugin__ - A plugin is a webpack extension that hooks into webpack in order to enhance or change how it does its thing.

### Sections and Webpack

The concept of sections is something that is unique to Calypso. It was created to make implementing code splits something that developers typically don’t have to think about and to connect code splits to routes so that all the code needed to render a route is referenced in `<script />` tags that are part of the initial HTML response.


#### Client

The sections module `client/sections.js` is transformed via a custom webpack loader `server/bundler/loader.js` into a series of `page.js` route handlers that use `require.ensure` to asynchronously load the JavaScript code needed for the route.

__before__:

```js
var sections = [
	{
		name: 'me',
		paths: [ '/me' ],
		module: 'me'
	}
];
```

__after__:

```js
page( /^\/me(\/.*)?$/, function( context, next ) {
	if ( _loadedSections[ 'me' ] ) {
		// section is already loaded so go ahead with things
		return next();
	}

	require.ensure( 'me', function( require, error ) {
		if ( error ) {
			// error handling
			return;
		}
		if ( !_loadedSections[ 'me' ] ) {
			require( 'me' )();
			_loadedSections[ 'me' ] = true;
		}

		// continue working through all the route handlers looking for matches
		// the array of routes will include those that were just required above
		next();
	} );
} );
```

Webpack then turns `require.ensure` into a jsonp function call that loads the script and then executes the callback `onload`. If there is an error loading the chunk, we append `?retry=1` and try refreshing. This should catch any situations where a user has an old version of the application running and for whatever reason the old version of the JavaScript file is no longer available (e.g. due to the static file cache being flushed).

#### Server

On the server, the sections module is used to determine which chunk to send to the client for a given request. This makes it possible to include the JavaScript needed to handle the initial request in the HTML response, which means that all the code needed to render has been loaded when the application boots. The same code for generating the regular expressions is used for both the client and the server to make sure that there aren't any discrepancies between the client and server in terms of when a particular chunk is included.


### JavaScript Asset Pipelines

There are two different modes of operation:

1. development - in development mode, the JavaScript are generated on-the-fly and cached in the server’s memory. The server is running an instance of the webpack compiler that is in watch mode so that it responds to changes to the files. If a file changes, the assets are regenerated and a hot update is emitted over a websocket to the client. The hot update is used by the React hot loader to replace the React component on-the-fly while preserving the components state.

2. production - in production mode, the files are written to the public directory by running the `yarn run build` command. The command runs `webpack`, generates a `assets.json` file, and then minifies each file. The `assets.json` file is used in the server to map the chunk name to the current asset.


### Caching

In most of the environments that Calypso is deployed to, the static assets are served and cached by nginx. Each filename includes a hash that is calculated by Webpack, which means that we can cache assets for all the various versions of Calpso that may be in active use. The hash also busts the cache on the client-side.

### Webpack Stats

Webpack stats can be serialized as JSON for the purposes of analyzing the results of a build. This can be used with tools like [Webpack Analyze](https://webpack.github.io/analyse/) or [Webpack Visualizer](https://chrisbateman.github.io/webpack-visualizer/) to visualize the modules and dependencies comprising a build. To generate a JSON file during a build, use the `preanalyze-bundles` NPM script:

```bash
NODE_ENV=production yarn run preanalyze-bundles
```

This will cause a JSON file `stats.json` to be written to the root project directory once the build succeeds.
