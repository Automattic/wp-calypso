export const postFormatsItemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site ID
		'^\\d+$': {
			type: 'object',
			description: 'List of supported post formats.',
			additionalProperties: false,
			patternProperties: {
				// ID of the post format
				'^[0-9a-z-_]+$': {
					type: 'string',
					description: 'Label of the post format',
				},
			},
		},
	},
};
