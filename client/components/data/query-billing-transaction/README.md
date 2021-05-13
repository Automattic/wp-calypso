# Query Billing Transaction

`<QueryBillingTransaction transactionId={ transactionId } />` is a React component used to ensure that a single transaction is fetched and ready to display.

## Usage

Render the component and pass `transactionId` as a prop. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryBillingTransaction from 'calypso/components/data/query-billing-transaction';
import Receipt from './receipt';

export default function MyBillingTransaction( { transactionId, transaction } ) {
	return (
		<div>
			<QueryBillingTransaction transactionId={ transactionId } />
			<Receipt item={ transaction } />
		</div>
	);
}
```

## Props

### `transactionId`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

ID of the transaction to be retrieved.
