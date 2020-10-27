export const schema = {
	type: 'object',
	additionalProperties: true,
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
		nextRefresh: {
			type: 'number',
		},
		variations: {
			type: 'object',
			additionalProperties: true,
		},
	},
};
