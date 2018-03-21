Query Billing Transaction
================

`<QueryBillingTransaction transactionId={ transactionId } />` is a React component used to ensure that a single transaction is fetched and ready to display. It also renders a `<QueryBillingTransactions />` component to first check if the requested `transactionId` is included in the most recent and cached transactions.

## Usage

Render the component and pass `transactionId` as a prop. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryBillingTransaction from 'components/data/query-billing-transaction';
import MyBillingTransactionsList from './list';

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
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The transaction ID to be retrieved.
