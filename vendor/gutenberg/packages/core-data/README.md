Core Data
=========

Core Data is a [data module](../data) intended to simplify access to and manipulation of core WordPress entities. It registers its own store and provides a number of selectors which resolve data from the WordPress REST API automatically, along with dispatching action creators to manipulate data.

Used in combination with features of the data module such as [`subscribe`](https://github.com/WordPress/gutenberg/tree/master/packages/data#subscribe-function) or [higher-order components](https://github.com/WordPress/gutenberg/tree/master/packages/data#higher-order-components), it enables a developer to easily add data into the logic and display of their plugin.

## Installation

Install the module

```bash
npm install @wordpress/core-data --save
```

## Example

Below is an example of a component which simply renders a list of categories:

```jsx
const { withSelect } = wp.data;

function MyCategoriesList( { categories, isRequesting } ) {
	if ( isRequesting ) {
		return 'Loading…';
	}

	return (
		<ul>
			{ categories.map( ( category ) => (
				<li key={ category.id }>{ category.name }</li>
			) ) }
		</ul>
	);
}

MyCategoriesList = withSelect( ( select ) => {
	const { getCategories, isRequestingCategories } = select( 'core' );

	return {
		categories: getCategories(),
		isRequesting: isRequestingCategories(),
	};
} );
```

## Actions

The following set of dispatching action creators are available on the object returned by `wp.data.dispatch( 'core' )`:

_Refer to `actions.js` for the full set of dispatching action creators. In the future, this documentation will be automatically generated to detail all available dispatching action creators._

## Selectors

The following selectors are available on the object returned by `wp.data.select( 'core' )`:

_Refer to `selectors.js` for the full set of selectors. In the future, this documentation will be automatically generated to detail all available selectors._

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
