# Calypso Data Stores

This package contains a collection of `@wordpress/data`-based stores that can be used to fetch data from various WordPress.com REST API endpoints.

It is meant to be helpful for projects developed inside the [Calypso monorepo](https://github.com/Automattic/wp-calypso) that don't want to use Calypso's (monolithic) Redux state tree.

## Usage

To use stores from the package, import the store object and use it directly. The store will be registered on import.

```tsx
import { ProductsList } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';

export const RenderProducts = ( { url } ) => {
	const { productsList } = useSelect(
		( select ) => ( {
			productsList: select( ProductsList.store ).getProductsList(),
		} ),
		[]
	);

	return (
		<ul>
			{ Object.entries( productsList?.data ?? {} ).map( ( [ productSlug, product ] ) => (
				<li key={ productSlug }>
					Name: { product.name }
				</li>
			) ) }
		</ul>
	);
};
```

## Types

The stores in this package are written in TypeScript, and type definitions are generated as part of the build process. If you import and use the store object directly (instead of using the string-based store name), you'll get automatic type inference.

For example:

![autocomplete](./autocomplete.gif)

## Old registration method

Some stores have not yet been migrated to use the new registration method. To use these stores, you must register them manually.)

```tsx
import { FooStore } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';

const FOO_STORE = FooStore.register();

export const Foo = () => {
	const foo = useSelect( ( select ) => select( FOO_STORE ).getFoo() );
	return <span>{ foo }</span>;
};
```
