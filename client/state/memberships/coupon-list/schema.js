/*
 * These are the parameters kept in metadata (custom fields)
 */
export const metadataSchema = {
	coupon_code: { type: 'string', metaKey: 'scoup_coupon_code' },
	discount_type: { type: 'string', metaKey: 'scoup_discount_type' },
	discount_value: { type: 'number', metaKey: 'scoup_discount_value' },
	discount_percentage: { type: 'number', metaKey: 'scoup_discount_percentage' },
	discount_currency: { type: 'string', metaKey: 'scoup_discount_currency' },
	start_date: { type: 'string', metaKey: 'scoup_start_date' },
	end_date: { type: 'string', metaKey: 'scoup_end_date' },
	plan_ids_allow_list: { type: 'array', metaKey: 'scoup_plan_ids_allow_list' },
	cannot_be_combined: { type: 'boolean', metaKey: 'scoup_cannot_be_combined' },
	first_time_purchase_only: { type: 'boolean', metaKey: 'scoup_first_time_purchase_only' },
	duration: { type: 'string', metaKey: 'scoup_duration' },
	email_allow_list: { type: 'array', metaKey: 'scoup_email_allow_list' },
};

/**
 * Schema of one coupon stored in custom post type.
 * @type {{type: string, properties: *}}
 */
const couponSchema = {
	type: 'object',
	properties: {
		ID: { type: 'number' },
		...metadataSchema,
	},
};

const couponListSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
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
