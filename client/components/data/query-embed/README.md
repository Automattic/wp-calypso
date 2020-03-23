Query Embed
================

`<QueryEmbed />` is a React component used in managing network requests for embed rendering for a given site and URL pair.

## Usage

Render the component, passing `siteId` and `url`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryEmbed from 'components/data/query-embed';

export default function MyEmbed( { embed } ) {
	return (
		<div>
			<QueryEmbed
				siteId={ 3584907 }
				url="https://www.facebook.com/20531316728/posts/10154009990506729/"
			/>
			
			<div key={ embed.embed_url }>
				{ embed.result }
			</div>
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

The site ID for which embed rendering should be requested.

### `url`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The URL for which embed rendering should be requested.
