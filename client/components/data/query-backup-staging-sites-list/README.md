# Query Backup Staging Sites List

`QueryBackupStagingSitesList` is a React component which dispatches actions for querying the list of staging sites related to specified site ID.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import QueryBackupStagingSitesList from 'calypso/components/data/query-backup-staging-sites-list';
import { useSelector } from 'calypso/state';

export { isFetchingStagingSitesList } from 'calypso/state/rewind/selectors/is-fetching-staging-sites-list';
export { hasFetchedStagingSitesList } from 'calypso/state/rewind/selectors/has-fetched-staging-sites-list';
export { getBackupStagingSites } from 'calypso/state/rewind/selectors/get-backup-staging-sites';

export default function MyComponent( { siteId } ) {
	const isFetching = useSelector( ( state ) => isFetchingStagingSitesList( state, siteId ) );
	const hasFetched = useSelector( ( state ) => hasFetchedStagingSitesList( state, siteId ) );
	const stagingSites = useSelector( ( state ) => getBackupStagingSites( state, siteId ) );

	return (
		<>
			<QueryBackupStagingSitesList siteId={ siteId } />
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

The site ID for which a list of staging sites should be requested.
