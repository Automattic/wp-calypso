wc-api
======

**The WooCommerce API access module for Calypso.**

This module connects the application to a WooCommerce Site via its API and manages local state.

## Features

* Provides a Higher Order Component that allows a component to define its data needs instead of performing fetches each time.
* Providing selectors to access data in various formats.
* Fetching data from each of the API endpoints. (products, orders, etc.)
* Holding cached data from previous fetches.
* Retrying API options when they fail, with an automatic back-off to prevent hammering the API (via data layer).
* Determining overall error states:
	- WooCommerce API Operational (determined by last successful API call).
	- WooCommerce API Not Available (plugin deactivated, uninstalled, detected via 404 errors).
	- WooCommerce API Not Responsive (multiple API calls timing out).

## Future features

This centralized design allows for some more sophisticated data handling down the line as well:

* Managing cached data
	- Allows a freshness requirement to be defined from components.
	- Automatically re-fetching data according to connected component freshness needs.
	- Avoiding fetching data that has already recently been fetched.
	- Releasing cached data when no longer needed for a period of time.
* Provides a single abstraction point to implement on other platforms (such as wp-admin)

## How to use

### Higher Order Component: `withWooCommerceSite`

The higher order component eliminates the need to track the site id of a connected WooCommerce site.
It also allows the WooCommerce API data requirements of a component to be defined declaratively instead
of trying a fetch each time the component is mounted.

```javascript
import { withWooCommerceSite } from 'woocommerce/state/wc-api';

class MyProductPage extends Component {

	render() {
		const { product, variations, productCategories } = this.props;

		return ...;
	}
}

function mapSiteDataToProps( siteData, ownProps, state ) {
	const { productId } = ownProps;
	const variationsExpanded = isVariationsExpanded( state );

	const product = siteData.products(
		{ productId },
		{ freshness: 1.5 * MINUTES },
	);

	const variations = siteData.productVariations(
		{ productId },
		{ freshness: ( variationsExpanded ? 1.5 : 10 ) * MINUTES },
	);

	const productCategories = siteData.productCategories(
		{ freshness: 1.5 * HOURS },
	);

	return {
		product,
		variations,
		productCategories,
	};
}

function mapSiteActionsToProps( siteActions, dispatch ) {
	return {
		updateProduct: dispatch( siteActions.products.update ),
		updateVariation: dispatch( siteActions.productVariations.update ),
	};
}

export default withWooCommerceSite( mapSiteDataToProps, mapSiteActionsToProps, MyProductPage );
```

And the wrapped component can be rendered as such:

```jsx
<MyProductPage wcApiSite={ { siteId } } productId={ 125 } />
```