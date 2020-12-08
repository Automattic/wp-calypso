# Query Backup Restore Status

`QueryBackupRestoreStatus` is a React component which dispatches actions for querying the status of a Backup backup.

## Usage

Render the component, passing `siteId` and `backupId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryBackupRestoreStatus from 'calypso/components/data/query-backup-backup-status';

export default function MyComponent( props ) {
	return (
		<div>
			<QueryBackupRestoreStatus backupId={ backupId } siteId={ siteId } />
			<ProgressBanner backupProgress={ backupProgress } />
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

### `downloadId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The download ID to be queried. If not provided, no query will be dispatched.
