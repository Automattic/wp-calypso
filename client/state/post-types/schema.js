export const items = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			additionalProperties: {
				type: 'object',
				required: [ 'slug' ],
				properties: {
					slug: { type: 'string' },
					labels: { type: 'object' },
					description: { type: 'string' },
					capabilities: { type: 'object' },
					hierarchical: { type: 'boolean' },
					supports: { type: 'object' }
				}
			}
		}
	}
};
