# Query Email Forwards

`<QueryEmailForwards />` is a React component used in managing network requests for email forwards.

## Usage

Render the component, passing in the properties below. It does not accept any children, nor does it render any elements to the page.

```jsx
import QueryEmailForwards from 'calypso/components/data/query-email-forwards';

export default function listEmailForwards( { emailForwards } ) {
	return (
		<div>
			<QueryEmailForwards domainName={ 'example.com' } />
			{ emailForwards.map( ( emailForwardItem ) => (
				<li>{ `${ emailForwardItem.mailbox }@${ emailForwardItem.domainName }` }</li>
			) ) }
		</div>
	);
}
```

## Props

### `domainName`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The domainName to fetch the email forwards for.
