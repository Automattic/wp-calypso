Query Video Stats
================

`<QueryVideoStats />` is a React component used in managing network requests for video stats.

## Usage

Render the component, passing `siteId` and `videoId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryVideoStats from 'components/data/query-video-stats';
import MyVideoStatItem from './stat-item';

export default function MyVideoStatItem( { stats } ) {
	return (
		<div>
			<QueryVideoStats siteId={ 3584907 } videoId={ 4533 } />
			<div>{ stats }</div>
		</div>
	);
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The site ID for which the video stat should be requested.

### `videoId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The video ID for which the stat should be requested.
