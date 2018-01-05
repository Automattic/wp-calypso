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

The sample code below is simplistic in a few ways (editing variations, for example), but it is here to illustrate how to use the HOC.
After the sample code is a list of detailed explanations of the pieces involved.

```javascript
import { withWooCommerceSite, siteActions } from 'woocommerce/state/wc-api';

class MyProductPage extends Component {

	onSave = () => {
		const { productWithEdits, updateProduct } = this.props;
		updateProduct( productWithEdits );
	}

	render() {
		const { productWithEdits, variations, productCategories } = this.props;

		return ...;
	}
}

function mapSiteDataToProps( siteData, ownProps, state ) {
	const { productId } = ownProps;
	const variationsExpanded = isVariationsExpanded( state );
	const productEdits = getProductEdits( state, productId );

	const product = siteData.products.single( productId, { freshness: 1.5 * MINUTES } );
	const productWithEdits = { ...product, ...productEdits };

	const variations = siteData.productVariations.forProduct(
		productId,
		{ freshness: ( variationsExpanded ? 1.5 : 10 ) * MINUTES },
	);

	const productCategories = siteData.productCategories.all(
		{ freshness: 1.5 * HOURS },
	);

	return {
		productWithEdits,
		variations,
		productCategories,
	};
}

const mappedSiteActions = {
	updateProduct: siteActions.products.update,
	updateVariation: siteActions.productVariations.update,
};

export default withWooCommerceSite( mapSiteDataToProps, mappedSiteActions )( MyProductPage );
```

And the wrapped component can be rendered as such:

```jsx
<MyProductPage wcApiSite={ { siteId } } productId={ 125 } />
```

#### Higher Order Component - Definitions

`withWooCommerceSite()` - This is the Higher Order Component itself. It is a function that takes two functions as parameters:
- `mapSiteDataToProps()` - Maps desired site data to props on this component (defined in more detail below).
- `mappedSiteActions` - Maps site actions to props (defined in more detail below).

`mapSiteDataToProps()` - A function to be defined, which returns props to be rendered. Has the following parameters available when called by the HOC. This is similar to redux connect's `mapStateToProps()`.
- `siteData` - A collection of functions that define the data needed from the WooCommerce API and return the current state of that data.
- `ownProps` - Props that are assigned to the implementation of this component and passed through here.
- `state` - The redux state, made available for normal selectors.

`mappedSiteActions` - An object that maps site actions to props. When passed into `withWooCommerceSite`, it maps pre-curried dispatch functions to the specified props. This is similar to redux connect's `mapDispatchToProps()`.

`wcApiSite` - The site identifier that pertains to the environment in which `wc-api` is running. For Calypso on WordPress.com, this is `{ siteId: <number> }`.
