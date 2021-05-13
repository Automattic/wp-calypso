# Post Formats

A module for managing post formats.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `requestPostFormats( siteId: number )`

Get a list of supported post formats for a given site.

```js
import { requestPostFormats } from 'calypso/state/post-formats/actions';

requestPostFormats( 12345678 );
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `postFormats`, with the following structure:

```js
state.postFormats = {
	requesting: {
		12345678: false,
		87654321: true,
	},
	items: {
		12345678: {
			image: 'Image',
			video: 'Video',
		},
		87654321: {
			status: 'Status',
		},
	},
};
```

## Selectors are intended to assist in extracting data from the global state tree for consumption by other modules

### `isRequestingPostFormats`

Returns true if post formats are currently fetching for the given site ID.

```js
import { isRequestingPostFormats } from 'calypso/state/post-formats/selectors';

const isRequesting = isRequestingPostFormats( state, 12345678 );
```

### `getPostFormats`

Returns an array of all supported site formats for the given site ID.

```js
import { getPostFormats } from 'calypso/state/post-formats/selectors';

const postFormats = getPostFormats( state, 12345678 );
```
