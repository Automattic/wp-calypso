export const itemsSchema = {
	type: 'object',
	properties: {
		posts: {
			type: 'object',
			patternProperties: {
				// global_ID: view count
				'^S_': {
					type: 'integer',
					minimum: 0,
				},
			},
		},
	},
	additionalProperties: false,
};
