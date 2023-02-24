export const productsReinstallSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		'^\\d+$': {
			type: 'object',
			properties: {
				started: { type: 'boolean' },
				failed: { type: 'boolean' },
				completed: { type: 'boolean' },
			},
		},
	},
};
