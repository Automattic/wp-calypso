Shortcodes
----------

Flux store and actions for retrieving a shortcode's render output from the [`GET /sites/$site/shortcodes/render` REST API endpoint](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/shortcodes/render/). Notably used by the [`<Shortcode />`](../../components/shortcode) component for rendering the result of a shortcode input.

## Usage

A single action is made available, `fetch`, which accepts a site ID and shortcode text to be rendered. The store is modeled as a [Flux Utils `ReduceStore`](https://facebook.github.io/flux/docs/flux-utils.html#reducestore-t), which can be subscribed to directly, or wrapped with a container view component using [Flux Utils `Container.create`](https://facebook.github.io/flux/docs/flux-utils.html#container).

Here's the typical structure of a store:

```js
{
	77203074: {
		"[gallery ids=\"1,2,3\"]": {
			status: 'LOADED',
			body: '<html></html>',
			scripts: {},
			styles: {}
		},
		"[gallery ids=\"4,5\"]": {
			status: 'LOADING'
		}
	}
}
```

An object entry for the shortcode is immediately included in the store, even before the request has completed. When monitoring the store, detect status as one of the [`LoadStatus` enum values](./constants.js).
