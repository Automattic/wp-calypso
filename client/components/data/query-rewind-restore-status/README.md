# Query Rewind Restore Status

`QueryRewindRestoreStatus` is a React component which dispatches actions for querying the status of a Rewind restore.

## Usage

Render the component, passing `siteId` and `restoreId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryRewindRestoreStatus from 'calypso/components/data/query-rewind-restore-status';

export default function MyComponent( props ) {
	return (
		<div>
			<QueryRewindRestoreStatus restoreId={ restoreId } siteId={ siteId } />
			<RewindRestore restoreProgress={ restoreProgress } />
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

The site ID for which terms should be requested.

### `restoreId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The restore ID to be queried. If not provided, no query will be dispatched.
