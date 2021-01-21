export const itemsSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			title: { type: 'string' },
			slug: { type: 'string' },
		},
	},
};
