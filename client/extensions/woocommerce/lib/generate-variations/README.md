# Generate Variations

Given a WooCommerce product object, this library will generate new WooCommerce variation objects based on the available product attributes.

## Example

```javascript
import generateVariations from 'calypso/lib/generate-variations';

// Provide a WooCommerce Product Object (from state or server)
const product = {
	id: 1,
	attributes: [
		{
			name: 'Color',
			options: [ 'Red', 'Blue' ],
			variation: true,
		},
		{
			name: 'Size',
			options: [ 'Small' ],
			variation: true,
		},
	],
};

const variations = generateVariations( product );
```

variations will contain the following:

```javascript
[
	{
		attributes: [
			{
				name: 'Color',
				option: 'Red',
			},
			{
				name: 'Size',
				option: 'Small',
			},
		],
	},
	{
		attributes: [
			{
				name: 'Color',
				option: 'Blue',
			},
			{
				name: 'Size',
				option: 'Small',
			},
		],
	},
];
```
