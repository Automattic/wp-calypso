export const schema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		anonId: {
			oneOf: [
				{
					type: 'string',
				},
				{
					type: 'null',
				},
			],
		},
		isLoading: {
			type: 'boolean',
		},
		nextRefresh: {
			type: 'number',
		},
		variations: {
			type: 'object',
			additionalProperties: false,
			patternProperties: {
				'^[a-z0-9_]+$': {
					oneOf: [
						{
							type: 'string',
						},
						{
							type: 'null',
						},
					],
				},
			},
		},
	},
};
