/** @format */

/**
 * This schema is necessarily fairly relaxed.
 *
 * The endpoint is not very consistent with the data it returns. For example, IDs appear to be
 * treated _mostly_ as integer strings, but some come back as integer numbers.
 *
 * Some booleans appear to have similar behavior. In particular, `is_domain` has observed values of
 * 'true' (string) or simply omitting the property. This can safely be coerced to a bool as long as
 * 'false' (string) is never a value.
 */

export default {
	definitions: {
		integerish: {
			oneOf: [ { type: 'string', pattern: '^\\d+$' }, { type: 'integer' } ],
		},
	},
	type: 'array',
	items: {
		type: 'object',
		required: [ 'ID', 'blog_id', 'user_id', 'product_id', 'product_slug' ],
		properties: {
			ID: { $ref: '#/definitions/integerish' },
			blog_id: { $ref: '#/definitions/integerish' },
			user_id: { $ref: '#/definitions/integerish' },

			product_id: { $ref: '#/definitions/integerish' },
			product_slug: { type: 'string' },

			/**
			 * More expected types
			 */
			// active: {},
			// amount: {},
			// attached_to_purchase_id: {},
			// blogname: {},
			// can_disable_auto_renew: {},
			// can_explicit_renew: {},
			// currency_code: {},
			// currency_symbol: {},
			// domain: {},
			// expiry_date: {},
			// expiry_status: {},
			// has_private_registration: {},
			// included_domain: {},
			// is_cancelable: {},
			// is_domain_registration: {},
			// is_domain: {},
			// is_refundable: {},
			// is_renewable: {},
			// is_renewal: {},
			// meta: {},
			// payment_card_id: {},
			// payment_card_processor: {},
			// payment_card_type: {},
			// payment_country_code: {},
			// payment_country_name: {},
			// payment_details: {},
			// payment_expiry: {},
			// payment_name: {},
			// payment_type: {},
			// pending_transfer: {},
			// product_name: {},
			// refund_amount: {},
			// refund_currency_symbol: {},
			// refund_period_in_days: {},
			// renew_date: {},
			// subscribed_date: {},
			// subscription_status: {},
			// tag_line: {},
			// user_id: {},
		},
	},
};
