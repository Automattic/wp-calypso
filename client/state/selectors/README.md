State Selectors
===============

This folder contains all available state selectors. Each file includes a single default exported function which can be used as a helper in retrieving derived data from the global state tree.

To learn more about selectors, refer to the ["Our Approach to Data" document](../../../docs/our-approach-to-data.md#selectors).

When adding a new selector to this directory, make note of the following details:

- Each new selector exists in its own file, named with [kebab case](https://en.wikipedia.org/wiki/Kebab_case) (dash-delimited lowercase)
- There should be no more than a single default exported function per selector file
- Tests for each selector should exist in the [`test/` subdirectory](./test) with matching file name of the selector
- Your selector must be exported from [`index.js`](./index.js) to enable named importing from the base `state/selectors` directory

```js
// is-my-favorite-song-selected.js

function notAnExportedFunction() {
	return 42;
}

/**
 * Returns the sum of the inputs
 *
 * Although this is exported, it's not the
 * default export and therefore it will not
 * appear in the selector search.
 *
 * @param {Number} a
 * @param {Number} b
 * @returns {Number} sum of a + b
 */
export function add( a, b ) {
	return a + b;
}

/**
 * Returns sad news about your favorite song
 *
 * @param {Object} state App state atom
 * @param {String} [song='Take the A Train']
 * @returns {Boolean} whether or not the given song is currently selected
 */
export function isMyFavoriteSongSelected( state, song ) {
	return false;
}

export default isMyFavoriteSongSelected;
```
