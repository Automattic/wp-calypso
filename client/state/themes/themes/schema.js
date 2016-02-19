export const themesSchema = {
	type: 'object',
	properties: {
		currentSiteId: { type: 'integer' },
		themes: {
			type: 'object',
			patternProperties: {
				//be careful to escape regexes properly
				'^[a-zA-Z0-9-_]+$': {
					type: 'object',
					required: [ 'id', 'author' ],
					properties: {
						id: { type: 'string' },
						author: { type: 'string' },
						screenshot: { type: 'string' },
						author_uri: { type: 'string' },
						demo_uri: { type: 'string' },
						name: { type: 'string' },
						stylesheet: { type: 'string' },
						price: { type: 'string' },
						active: { type: 'boolean' }
					}
				}
			},
			additionalProperties: false
		}
	},
	additionalProperties: false
};
