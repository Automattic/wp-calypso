ProductSearch
=============

This component is used to search through the products on a given site.

#### How to use:

```jsx
import Card from 'components/card';
import ProductSearch from 'woocommerce/components/product-search';

render: function() {
	const onChange = products => {
		// Do something with your products array
	};

	return (
		<Card>
			<ProductSearch onChange={ onChange } />
		</Card>
	);
}
```

#### Props

* `onChange`: Function called when a result is clicked, with product object as an argument.
