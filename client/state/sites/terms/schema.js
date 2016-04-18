export const termsSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			patternProperties: {
				'^\\d+$': {
					type: 'object',
					required: [ 'ID', 'name' ],
					properties: {
						ID: { type: 'number' },
						name: { type: 'string' },
						slug: { type: 'string' },
						description: { type: 'string' },
						post_count: { type: 'number' },
						parent: { type: 'number' }
					},
					additionalProperties: false
				}
			},
			additionalProperties: false
		}
	},
	additionalProperties: false
};

export const taxonomiesSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			patternProperties: {
				'^[A-Za-z0-9-_]+$': {
					type: 'array',
					additionalProperties: false
				}
			},
		}
	},
	additionalProperties: false
};
