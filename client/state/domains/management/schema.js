export const domainWhoisSchema = {
	type: 'object',
	additionalProperties: true,
	patternProperties: {
		first_name: { type: 'string' },
		last_name: { type: 'string' },
		email: { type: 'string' },
		phone: { type: 'string' },
		address1: { type: 'string' },
		address2: { type: 'string' },
		city: { type: 'string' },
		state: { type: 'string' },
		postal_code: { type: 'string' },
		country_code: { type: 'string' },
	},
};
