# Formatted Variation Name

WooCommerce variations do not have a proper 'name' field.

This method will return a formatted variation name based on the attribute options that a variation contains.

## Example (1 Attribute)

```javascript
import formattedVariationName from 'calypso/lib/formatted-variation-name';

// Provide a WooCommerce Variation Object (from state or server)
const variation = {
	id: 1,
	visible: true,
	attributes: [
		{
			name: 'Color',
			option: 'Red',
		},
	],
};

return formattedVariationName( variation );
```

Returns `Red`.

## Example (Multiple Attributes)

```javascript
import formattedVariationName from 'calypso/lib/formatted-variation-name';

// Provide a WooCommerce Variation Object (from state or server)
const variation = {
	id: 1,
	visible: true,
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
};

return formattedVariationName( variation );
```

Returns `Red - Small`.

## Example (Fallback)

```javascript
import formattedVariationName from 'calypso/lib/formatted-variation-name';

// Provide a WooCommerce Variation Object (from state or server)
// This is a variation that provides fallback settings for the other variations.
const variation = {
	id: 1,
	visible: true,
	attributes: [],
};

return formattedVariationName( variation, 'All Variations' );
```

Returns `All Variations`.
