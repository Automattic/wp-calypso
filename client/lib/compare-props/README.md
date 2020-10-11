# Comparing object properties

This module exports a helper that creates customized comparator functions to compare
objects. The comparator can be configured to compare only selected properties and
ignore all other ones, and compare some properties shallowly and other ones deeply.

If no options are specified, the comparator will compare all properties shallowly:

```js
const comparator = compareProps();

// returns true: the property values are strictly equal
comparator( { a: 1 }, { a: 1 } );

// returns false: the property values are not strictly equal
comparator( { a: [] }, { a: [] } );
```

## `ignore` option

Specify an `ignore` list of properties that should be ignored by the comparator:

```js
const comparator = compareProps( { ignore: [ 'irrelevant' ] } );

// returns true: the `a` properties are strictly equal and other are irrelevant
comparator(
	{
		a: 1,
		irrelevant: 'whatever1',
	},
	{
		a: 1,
		irrelevant: 'whatever2',
	}
);
```

## `deep` option

To compare selected properties deeply, specify a `deep` option:

```js
const comparator = compareProps( { deep: [ 'query' ] } );

// returns true: the `page` properties are are strictly equal and
// the `query` objects are deeply equal, although not identical
comparator(
	{
		query: { text: 'plugin' },
		page: 2,
	},
	{
		query: { text: 'plugin' },
		page: 2,
	}
);
```

## `shallow` option

If you want to compare only some selected properties shallowly, it's more convenient
to enumerate them in a `shallow` option instead of a long `ignore` list. This option
also comes handy if the compared objects can have arbitrary extra properties that are
not relevant for the comparison.

```js
const comparator = compareProps( { shallow: [ 'id' ] } );

// returns true: the `id` properties are strictly equal and all others are ignored
comparator(
	{
		id: 1,
		is_jetpack: true,
	},
	{
		id: 1,
		is_domain_only: true,
	}
);
```
