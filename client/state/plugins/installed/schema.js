export const pluginsSchema = {
	type: 'object',
	patternProperties: {
		//be careful to escape regexes properly
		'^[0-9]+$': {
			type: 'array',
			items: {
				required: [ 'id', 'slug', 'name', 'active', 'autoupdate' ],
				properties: {
					id: { type: 'string' },
					slug: { type: 'string' },
					active: { type: 'boolean' },
					name: { type: 'string' },
					plugin_url: { type: 'string' },
					version: { type: 'string' },
					description: { type: 'string' },
					author: { type: 'string' },
					author_url: { type: 'string' },
					network: { type: 'boolean' },
					autoupdate: { type: 'boolean' },
					update: { type: 'object' },
				},
			},
		},
	},
	additionalProperties: false,
};
