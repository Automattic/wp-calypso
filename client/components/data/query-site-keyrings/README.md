# Query Site Keyrings

`<QuerySiteKeyrings />` is a React component used in managing network requests for site keyrings.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QuerySiteKeyrings from 'calypso/components/data/query-site-keyrings';

export default function MyKeyringsPage( { keyrings } ) {
	return (
		<div>
			<QuerySiteKeyrings siteId={ 3584907 } />
			<div>{ JSON.stringify( keyrings ) }</div>
		</div>
	);
}
```

### Props

Props are displayed as a table with Name, Type, Default, and Description as headings. Required props are marked with `*`.

| Name     | Type     | Default | Description                                             |
| -------- | -------- | ------- | ------------------------------------------------------- |
| `siteId` | `number` | `null`  | The site ID for which the keyrings should be requested. |

### General guidelines

Add this component to the `render()` method wherever you need to have `state.siteKeyrings` populated for your site.
