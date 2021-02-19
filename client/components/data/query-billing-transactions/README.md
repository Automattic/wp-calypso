# Query Billing Transactions

`<QueryBillingTransactions />` is a React component used in managing network requests for billing transactions.

## Usage

Render the component as a child in any component. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryBillingTransactions from 'calypso/components/data/query-billing-transactions';
import MyBillingTransactionsList from './list';

export default function MyBillingTransactions( { billingTransactions } ) {
	return (
		<div>
			<QueryBillingTransactions />
			{ billingTransactions.map( ( billingEntries, billingEntryType ) => {
				return <MyBillingTransactionsList items={ billingEntries } />;
			} ) }
		</div>
	);
}
```

## Props

This component does not support any additional props.
