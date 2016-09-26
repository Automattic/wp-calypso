export const statesListSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^[A-Z]{2}$': {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					code: {
						type: 'string'
					},
					name: {
						type: 'string'
					}
				},
				required: [
					'code',
					'name'
				]
			}
		}
	}
};
