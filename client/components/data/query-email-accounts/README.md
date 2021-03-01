# Query Email Accounts

`<QueryEmailAccounts />` is a React component used in managing network requests for all Email Accounts across providers for a site.

## Usage

Render the component, passing in the properties below. It does not accept any children, nor does it render any elements to the page.

```jsx
import QueryEmailAccounts from 'calypso/components/data/query-email-accounts';

export default function listEmailAccounts( { emailAccounts } ) {
	return (
		<div>
			<QueryEmailAccounts siteId={ siteId } />
			{ emailAccounts.map( ( emailAccount ) => (
				<li>{ `${ emailAccount.mailbox }@${ emailAccount.domain }` }</li>
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

The ID of the site to fetch the email accounts users for.
