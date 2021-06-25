# Query Rewind Backups

`QueryRewindBackups` is a React component which dispatches actions for querying the details of a site's most recent Rewind backups.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import { useSelector } from 'react-redux';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';

export default function MyComponent( { siteId } ) {
	const rewindBackups = useSelector( getRewindBackups( siteId ) );

	return (
		<>
			<QueryRewindBackups siteId={ siteId } />
			<MyOtherComponent backups={ rewindBackups } />
		</>
	);
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which a list of the most recent backups should be requested.
