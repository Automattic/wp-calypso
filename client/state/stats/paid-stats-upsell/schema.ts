export const schema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^\\d+$': {
			type: 'object',
			properties: {
				view: { type: 'boolean' },
				siteSlug: { type: 'string' },
				statType: { type: 'string' },
			},
			required: [ 'view', 'siteSlug', 'statType' ],
			additionalProperties: false,
		},
	},
	additionalProperties: false,
};
