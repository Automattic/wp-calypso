export const itemsSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			id: { type: 'integer' },
			title: { type: 'string' },
			slug: { type: 'string' },
			sites_count: { type: 'integer' },
		},
	},
};
