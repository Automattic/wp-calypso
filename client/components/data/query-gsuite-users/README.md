# Query G Suite Users

`<QueryGSuiteUsers />` is a React component used in managing network requests for G Suite Users.

## Usage

Render the component, passing in the properties below. It does not accept any children, nor does it render any elements to the page.

```jsx
import QueryGSuiteUsers from 'calypso/components/data/query-gsuite-users';

export default function listGSuiteUsers( { gsuiteUsers } ) {
	return (
		<div>
			<QueryGSuiteUsers siteId={ siteId } />
			{ gsuiteUsers.map( ( gsuiteUser ) => (
				<li>{ `${ gsuiteUser.mailbox }@${ gsuiteUser.domain }` }</li>
			) ) }
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

The ID of the site to fetch the G Suite users for.
