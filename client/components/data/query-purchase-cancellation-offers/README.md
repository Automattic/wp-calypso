# Query Purchase Cancellation Offers

`<QueryPurchaseCancellationOffers />` is a React component used in managing network requests for product cancellation offers.

## Usage

Render the component, passing in the properties below. It does not accept any children, nor does it render any elements to the page.

```tsx
/* eslint-disable */
import QueryPurchaseCancellationOffers from 'calypso/components/data/query-purchase-cancellation-offers';
import getCancellationOffers from 'calypso/state/cancellation-offers/selectors/get-cancellation-offers';

const listProductPrice: React.FC = ( { product } ) => {
	const cancellationOffers = useSelector( ( state ) =>
		getCancellationOffers( state, product.purchaseId )
	);

	return (
		<div>
			<QueryPurchaseCancellationOffers siteId={ product.siteId } purchaseId={ product.purchaseId } />
		</div>
	);
};
```

## Props

<table>
	<tr>
		<th>Name</th>
		<td>Required</td>
		<td>Type</td>
		<td>Description</td>
	</tr>
	<tr>
		<th>siteId</th>
		<td>Yes</td>
		<td>Number</td>
		<td>The ID of the site the purchase is associated with.</td>
	</tr>
	<tr>
		<th>purchaseId</th>
		<td>Yes</td>
		<td>Number</td>
		<td>The ID of the purchase to get offers for.</td>
	</tr>
</table>
