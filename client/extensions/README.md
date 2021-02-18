# Extensions

Welcome to Calypso! This is the place where you can write your own extensions for your WordPress plugins. Extensions are set up to function in a semi-isolated environment, with their own URL path and code chunk magic (using webpack) to assure code is loaded only when needed. Think of extensions as individual "apps" you can access in Calypso to interact with your plugin functionality in a focused way. At the moment, extensions are generated at build time.

If you're a developer that has a plugin with one million or more active installations, we'd love to work with you. Please [use this form](https://developer.wordpress.com/calypso-extensions/) to get in touch with us.

Before you get started we encourage you to get familiar with our [development values], [code-reviewing practice][prs], components and [data approach], and the [rest of the docs][docs] we have. Every folder in the project should have a README describing its purpose.

## Defining a new section

Create a new directory within `/client/extensions` with your plugin name. Add a `package.json` file at the root of your directory. Add a `section` field in the same format as those found in `client/sections.js`:

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

This definition will generate a new `hello-world.js` bundle using `/client/extensions/hello-world/index.js` as the entry path. The `paths` array specifies at which route your bundle will be served.

The rest of the attributes handle different configuration settings: `group` is used to attach your section to one of the top-level areas (sites, reader, me, editor); `secondary` is used to determine whether the sidebar should be shown for your section or not.

## Basic rendering

`index.js` will be assumed to be the entry point to your extension. That file should export a function that sets up routing for your plugin extension:

```js
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { helloWorld } from './controller';

export default () => {
	page( '/hello-world', siteSelection, navigation, helloWorld, makeLayout, clientRender );
};
```

At the moment we use a simple routing interface with `page.js`. There are a few useful middleware functions you can leverage from the My Sites controller module, like `siteSelection`, `navigation`, or `sites`. It’s important to note Calypso is designed to be multi-site from the start. Our URLs in general look like `/:section/:filter/:site`, with the site usually being the last piece of the URL. If you remove the site fragment you get what we call the "all-sites URL". How a section handles the all-sites URL is up to itself. Some areas, like Stats, Posts, Pages, Plugins, will show resources from across all your sites. Other sections, like Settings for example, would display a site picker if you try to access them without a site in the URL bar. That is what `sitesController.sites` does: it forces the user to pick a site to access a section.

`helloWorld` in this case is the one you need to create and is responsible for rendering your section:

```js
export const helloWorld = ( context, next ) => {
	context.primary = <HelloWorld />;
	next();
};
```

_Note:_ you have access to all the components and blocks that Calypso offers (check out `/devdocs/design` and `/devdocs/blocks` to browse them). With those you can build an entirely new section that is consistent with the experience of the whole app. We encourage you to use them as much as possible, and to contribute back to the core project if you find issues or have suggestions for new ones.

## Imports

Importing from other javascript modules can be done from one of three root contexts:

- / (root of the Calypso repository)
- /client (the client subdirectory)
- /client/extensions (the extensions subdirectory)

The last one is especially convenient in extension development as it makes the following possible:

```js
import myReducer from 'my-extension/state/reducer';
```

## State

Calypso has almost transitioned to a single-state store provided by Redux. The end scenario is that your extension would have access to the entire state tree and would be allowed to add a sub-tree. This is a work in progress and we need to figure out what are the requirements and safeguards we need to put in place.

[development values]: https://wpcalypso.wordpress.com/devdocs/docs/guide/0-values.md
[data approach]: https://wpcalypso.wordpress.com/devdocs/docs/our-approach-to-data.md
[docs]: https://wpcalypso.wordpress.com/devdocs
[prs]: https://wpcalypso.wordpress.com/devdocs/docs/CONTRIBUTING.md#pull-requests
