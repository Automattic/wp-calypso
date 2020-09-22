# ProductSearch

This component is used to search through the products on a given site.

## How to use

To select multiple products:

```jsx
import { Card } from '@automattic/components';
import ProductSearch from 'woocommerce/components/product-search';

function render() {
	const updateProducts = ( productIds ) => {
		this.setState( { list: productIds } );
	};

	return (
		<Card>
			<ProductSearch onChange={ this.updateProducts } value={ this.state.list } />
		</Card>
	);
}
```

To select a single product:

```jsx
import { Card } from '@automattic/components';
import ProductSearch from 'woocommerce/components/product-search';

function render() {
	const updateProduct = ( productId ) => {
		this.setState( { selected: productId } );
	};

	return (
		<Card>
			<ProductSearch singular onChange={ this.updateProduct } value={ this.state.selected } />
		</Card>
	);
}
```

## Props

- `onChange`: Function called when a result is clicked, with product object as an argument.

- `singular`: Boolean, If true, this should use radio inputs and only allow for one product/variation to be selected at a time. If false, multiple products and variations can be selected, and value is an array.

- `value`: List of IDs or single ID of a product or variation.
