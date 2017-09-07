Query Rewind Restore Status
===========================

`QueryRewindRestoreStatus` is a React component which dispatches actions for querying the status of a Rewind restore.

## Usage

Render the component, passing `siteId` and `restoreId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

This query component differs slightly from other query components. It accepts `delay` and `freshness` props. When used in combination, these two props allow for "polling", i.e. repeating the same query. Whenever the `restoreId` or `freshness` props change, the component knows it should dispatch a new query. When the data is received, `freshness` should be change accordingly and the component will dispatch.

This is very useful for checking the progress of a restore because by providing freshness we can poll for updates. We can also rely on persisted state to resume checking the status of a restore.

```jsx
import React from 'react';
import QueryRewindRestoreStatus from 'components/data/query-rewind-restore-status';

export default function MyComponent( props ) {
	return (
		<div>
			<QueryRewindRestoreStatus
				freshness={ freshness }
				delay={ 1500 }
				restoreId={ restoreId }
				siteId={ siteId }
			/>
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

### `timestamp`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The requested restore timestamp. If not provided, no query will be dispatched.

### `delay`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
	<tr><th>Default</th><td>0</td></tr>
</table>

The query will be delayed by this amount (ms).

### `freshness`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Freshness will be compared when props are changed to know if a new query should be dispatched.
