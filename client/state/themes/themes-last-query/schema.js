export const themesLastQuerySchema = {
	type: 'object',
	properties: {
		previousSiteId: { type: 'integer' },
		currentSiteId: { type: 'integer' },
		isJetpack: { type: 'boolean' },
		lastParams: {
			type: 'object',
			properties: {
				tier: { type: 'string' },
				page: { type: 'integer' },
				perPage: { type: 'integer' }
			}
		}
	},
	additionalProperties: false
};
