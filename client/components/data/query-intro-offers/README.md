# Query Intro Offers

`<QueryIntroOffers />` is a React component used in managing network requests product introductory offers.

## Usage

Render the component, passing in the properties below. It does not accept any children, nor does it render any elements to the page.

```jsx
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import getIntroOfferPrice from 'calypso/state/selectors/get-intro-offer-price';

export default function listProductPrice( { siteId, productId, productPrice } ) {
	const introOfferPrice = useSelector( ( state ) =>
		getIntroOfferPrice( state, siteId, productId )
	);

	return (
		<div>
			<QueryIntroOffers siteId={ siteId } />
			<span>{ introOfferPrice ?? productPrice } ></span>
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

The ID of the site to fetch the introductory offers for.
