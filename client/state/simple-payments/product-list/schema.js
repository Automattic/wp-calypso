/** @format */
/**
 * External dependencies
 */
import config from 'config';
/**
 * These are the parameters kept in metadata (custom fields)
 */

export const metadataSchema = {
	currency: { type: 'string', metaKey: 'spay_currency' },
	price: { type: 'string', metaKey: 'spay_price' },
	multiple: { type: 'boolean', metaKey: 'spay_multiple' },
	status: { type: 'string', metaKey: 'spay_status' },
	email: { type: 'string', metaKey: 'spay_email' },
	formatted_price: { type: 'string', metaKey: 'spay_formatted_price' },
	...( config.isEnabled( 'memberships' ) && {
		recurring: { type: 'boolean' },
		stripe_account: { type: 'string' },
		renewal_schedule: { type: 'string' },
	} ),
};

/**
 * Schema of one product stored in custom post type.
 * @type {{type: string, properties: *}}
 */
const productSchema = {
	type: 'object',
	properties: {
		title: { type: 'string' },
		description: { type: 'string' },
		ID: { type: 'number' },
		...metadataSchema,
	},
};

const productListSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'array',
			items: productSchema,
		},
	},
	additionalProperties: false,
};

/**
 * Map that maps custom field keys to corresponding keys in redux representation of a product
 * @type { Object }
 */
export const metaKeyToSchemaKeyMap = Object.keys( metadataSchema ).reduce( ( prev, curr ) => {
	prev[ metadataSchema[ curr ].metaKey ] = curr;
	return prev;
}, {} );

export default productListSchema;
