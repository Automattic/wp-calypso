/**
 * Schema of one coupon stored in custom post type.
 * @type {{type: string, properties: *}}
 */
const giftSchema = {
	type: 'object',
	properties: {
		gift_id: { type: 'number' },
		user_id: { type: 'number' },
		plan_id: { type: 'number' },
	},
};

export default giftSchema;
