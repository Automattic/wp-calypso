Query Shortcode
================

`<QueryShortcode />` is a React component used in managing network requests for a specific shortcode in a given site.

## Usage

Render the component, passing `siteId` and `shortcode`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryShortcode from 'components/data/query-shortcode';
import MySiteShortcodeItemDetail from './item-detail';

export default function MySiteShortcodeItem( { shortcode } ) {
	return (
		<div>
			<QueryShortcode siteId={ 12345678 } />
			<MySiteShortcodeItemDetail shortcode={ shortcode } />
		</div>
	);
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which the shortcode should be requested.

### `shortcode`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The shortcode that should be requested.
