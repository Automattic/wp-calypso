# Extensions

Welcome to Calypso! This is the place where you can write your own extensions for your WordPress plugins. Extensions are setup to function in a semi-isolated environment, with their own url path and code chunk magic (using webpack) to assure code is loaded only when needed. Think of extensions as individual "apps" you can access in Calypso to interact with your plugin functionality in a focused way. At the moment, extensions are generated at build time.

Before you get started we encourage you to get familiar with our development values, code reviewing practice, components and data approach, and the rest of the docs we have. Every folder in the project should have a readme describing its purpose.

## Defining a new section

Create a new directory within `/client/extensions` with your plugin name. Add a `package.json` file at the root of your directory. Add a `section` field in the same format as those found in `client/wordpress-com.js`:

```json
{
	"name": "hello-world",
	"section": {
		"name": "hello-world",
		"paths": [ "/hello-world" ],
		"module": "hello-world",
		"group": "sites",
		"secondary": true,
		"enableLoggedOut": true
	}
}
```

This definition will generate a new `hello-world.js` bundle using `/client/extensions/hello-world/index.js` as the entry path. The “paths” array specifies at which route your bundle will be served.

The rest of the attributes handle different configuration settings: “group” is used to attach your section to one of the top-level areas (sites, reader, me, editor); “secondary” is used to determine whether the sidebar should be shown for your section or not.

## Basic rendering

`index.js` will be assumed to be the entry point to your extension. That file should export a function that sets up routing for your plugin extension:

```js
export default function() {
	page( '/hello-world', siteSelection, navigation, renderHelloWorld );
}
```

At the moment we use a simple routing interface with `page.js`. There are a few useful middlewares you can leverage, like `siteSelection` and `navigation`. It’s important to note Calypso is designed to be multisite from the start. Our urls in general look like `/:section/:filter/:site`, with site usually being the last piece of the url. If you remove the site fragment you get what we call the "all-sites url". How a section handles the all-sites url is up to them. Some areas, like stats, posts, pages, plugins, will show resources from across all your sites. Other sections, like “settings” for example, would display a site picker if you try to access them without a site in the url bar. That is what `siteSelection` does, force the user to pick a site to access a section.

`renderHelloWorld` in this case is the one you need to create and is responsible for rendering your section:

```js
const renderHelloWorld = ( context ) => {
	renderWithReduxStore( (
		<Main>
			<HelloWorld />
		</Main>
	), document.getElementById( 'primary' ), context.store );
};
```

*Note:* you have access to all the components and blocks that Calypso offers (check out `/devdocs/design` and `/devdocs/blocks` to browse them). With those you can build an entirely new section that is consistent with the experience of the whole app. We encourage you to use them as much as possible, and to contribute back to the core project if you find issues or have suggestions for new ones.

## State

Calypso has almost transitioned to a single state store provided by Redux. Your extension would have access to the state tree and the possibility of adding a sub-tree. This is a work in progress and we need to figure out what are the requirements and safeguards we need to put in place.
