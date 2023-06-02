# Query Backup Staging Site Info

`QueryBackupStagingSite` is a React component which dispatches actions for querying the list of staging sites related to specified site ID.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import QueryBackupStagingSite from 'calypso/components/data/query-backup-staging-site';
import { useSelector } from 'calypso/state';
import getBackupStagingSiteInfo from 'calypso/state/rewind/selectors/get-backup-staging-site-info';
import hasFetchedStagingSiteInfo from 'calypso/state/rewind/selectors/has-fetched-staging-site-info';
import isRequestingStagingSiteInfo from 'calypso/state/rewind/selectors/is-requesting-staging-site-info';

export default function MyComponent( { siteId } ) {
	const isRequesting = useSelector( ( state ) => isRequestingStagingSiteInfo( state, siteId ) );
	const hasFetched = useSelector( ( state ) => hasFetchedStagingSiteInfo( state, siteId ) );
	const stagingInfo = useSelector( ( state ) => getBackupStagingSiteInfo( state, siteId ) );

	return (
		<>
			<QueryBackupStagingSite siteId={ siteId } />
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

The site ID for which a staging info should be requested.
