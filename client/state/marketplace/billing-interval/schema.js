export const billingIntervalSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		interval: { type: 'string' },
	},
};
