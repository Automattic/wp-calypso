# Query Site Roles

`<QuerySiteRoles />` is a React component used in managing network requests for site roles.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QuerySiteRoles from 'calypso/components/data/query-site-roles';
import MySiteRolesListItem from './list-item';

export default function MySiteRolesList( { siteRoles } ) {
	return (
		<div>
			<QuerySiteRoles siteId={ 12345678 } />
			{ siteRoles.map( ( role ) => {
				return <MySiteRolesListItem role={ role } />;
			} ) }
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

The site ID for which site roles should be requested.
