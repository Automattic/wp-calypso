# Query Site Invites

`QuerySiteInvites` is a React component used in managing the fetching of invite
objects for a site.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor
does it render any elements to the page. You can use it adjacent to other
sibling components which make use of the fetched data made available through
the global application state.

```jsx
import React from 'react';
import { connect } from 'react-redux';
import QuerySiteInvites from 'calypso/components/data/query-site-invites';

const SITE_ID = 3584907;

function MyInvitesList( { invites } ) {
	return (
		<div>
			<QueryInvites siteId={ SITE_ID } />
			{ invites.map( ( invite ) => {
				return <MyInvitesListItem key={ invite.invite_key } invite={ invite } />;
			} ) }
		</div>
	);
}

export default connect( ( state ) => {
	return {
		pendingInvites: getPendingInvitesForSite( state, SITE_ID ),
	};
} )( MyInvitesList );
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The site ID for which invites should be queried.
