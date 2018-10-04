Query Users
===========

`<QueryUsers />` is a React component used to request users data.

## Usage

Render the component, passing `siteId` and `userIds`. It does not accept any children, nor does it render any element to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryUsers from 'components/data/query-users';

export default function Users( { users } ) {
	return (
		<div>
			<QueryUsers
				siteId={ 12345678 }
				userIds={ userIds }
			/>
			<div>{ users }</div>
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

The site ID for which we request post revisions.


### `userIds`

<table>
	<tr><th>Type</th><td>Array[Number]</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Limit result set to specific IDs. The userIds will be filtered to exclude the current user in order to only request data that is not present yet, as well as to preserve the current user state.
