ProductSearch
=============

This component is used to search through the products on a given site.

#### How to use:

```jsx
import Card from 'components/card';
import ProductSearch from 'woocommerce/components/product-search';

render: function() {
	const onSelect = product => {
		// Do something with product object
	};

	return (
		<Card>
			<ProductSearch onSelect={ onSelect } />
		</Card>
	);
}
```

#### Props

* `onSelect`: Function called when a result is clicked, with product object as an argument.
