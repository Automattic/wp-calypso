# Query Titan Users

`<QueryTitanUsers />` is a React component used in managing network requests for Titan Users.

## Usage

Render the component, passing in the properties below. It does not accept any children, nor does it render any elements to the page.

```jsx
import QueryGSuiteUsers from 'components/data/query-titan-users';

export default function listTitanUsers( { titanUsers } ) {
	return (
		<div>
			<QueryTitanUsers siteId={ siteId } />
			{ titanUsers.map( titanUser => (
				<li>{ `${ titanUser.mailbox }@${ titanUser.domain }` }</li>
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

The ID of the site to fetch the Titan users for.
