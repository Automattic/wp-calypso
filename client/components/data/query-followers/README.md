# QueryFollowers

`<QueryFollowers />` is a React component used in managing network requests for followers of a given site.

## Usage

Render the component, passing `query`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state. This component will refresh data from the latest every 30 seconds.

```jsx
import React from 'react';
import { useSelector } from 'react-redux';
import QueryFollowers from 'calypso/components/data/query-followers';
import { getFollowersForQuery } from 'calypso/state/followers/selectors';

export default function FollowersList( { siteId } ) {
	const query = { siteId, page: 1 };
	const followers = useSelector( ( state ) => getFollowersForQuery( state, query ) );

	return (
		<div>
			<QueryFollowers query={ query } />

			{ followers?.map( ( follower ) => (
				<div key={ follower.ID }>{ follower.label }</div>
			) ) }
		</div>
	);
}
```

## Props

### `query`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

A bunch of query params to filter the API response. See the [API documentation](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/followers/) for a detailed list of options.