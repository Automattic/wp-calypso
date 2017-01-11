Query Billing Data
================

`<QueryBillingData />` is a React component used in managing network requests for billing data.

## Usage

Render the component as a child in any component. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryBillingData from 'components/data/query-billing-data';
import MyBillingDataList from './list';

export default function MyBillingData( { billingData } ) {
	return (
		<div>
			<QueryBillingData />
			{ billingData.map( ( billingEntries, billingEntryType ) => {
				return (
					<MyBillingDataList items={ billingEntries } />
				);
			} }
		</div>
	);
}
```

## Props

This component does not support any additional props.
