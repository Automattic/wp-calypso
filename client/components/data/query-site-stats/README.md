Query Site Stats
================

`<QuerySiteStats />` is a React component used in managing network requests for site stast for a given site and stat type.

## Usage

Render the component, passing `siteId` and `statType`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QuerySiteStats from 'components/data/query-site-stats';

export default function AmazingVisualizationOfStats( { stats } ) {
	return (
		<ul>
			<QuerySiteStats
				siteId={ 3584907 }
				statType="statsStreak" />
			{ stats.map( ( stat ) => {
				return (
					<span>A span o { stat }</span>
				);
			} }
		</ul>
	);
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which stats should be requested.

### `statType`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The statType desired, see supported stats lists in [wpcom.js](https://github.com/Automattic/wpcom.js/blob/master/lib/runtime/site.get.js#L13-L29).

### `query`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Query object passed to API
