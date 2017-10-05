/** @format */
export const itemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			additionalProperties: false,
			patternProperties: {
				// Plugin ID
				'^\\w+$': {
					desc: { type: 'string' },
					enabled: { type: 'boolean' },
					key: { type: 'string' },
					title: { type: 'string' },
					url: { type: 'string' },
				},
			},
		},
	},
};
