/*
 * These are the parameters kept in metadata (custom fields)
 */
export const metadataSchema = {
	coupon_code: { type: 'string', metaKey: 'scoup_coupon_code' },
	discount_type: { type: 'string', metaKey: 'scoup_discount_type' },
	discount_value: { type: 'number', metaKey: 'scoup_discount_value' },
	discount_percentage: { type: 'number', metaKey: 'scoup_discount_percentage' },
	start_date: { type: 'string', metaKey: 'scoup_start_date' },
	end_date: { type: 'string', metaKey: 'scoup_end_date' },
	product_ids: { type: 'array', metaKey: 'scoup_product_ids' },
	cannot_be_combined: { type: 'boolean', metaKey: 'scoup_cannot_be_combined' },
	first_time_only: { type: 'boolean', metaKey: 'scoup_first_time_only' },
	duration: { type: 'string', metaKey: 'scoup_duration' },
	specific_emails: { type: 'array', metaKey: 'scoup_specific_emails' },
};

/**
 * Schema of one coupon stored in custom post type.
 * @type {{type: string, properties: *}}
 */
const couponSchema = {
	type: 'object',
	properties: {
		description: { type: 'string' },
		ID: { type: 'number' },
		...metadataSchema,
	},
};

const couponListSchema = {
	type: 'object',
	patternProperties: {
		'\\d+$': {
			type: 'array',
			items: couponSchema,
		},
	},
	additionalProperties: false,
};

/**
 * Map that maps custom field keys to corresponding keys in redux representation of a product
 * @type {Object}
 */
export const metaKeytoSchemaKeyMap = Object.keys( metadataSchema ).reduce( ( prev, curr ) => {
	prev[ metadataSchema[ curr ].metaKey ] = curr;
	return prev;
}, {} );

export default couponListSchema;
