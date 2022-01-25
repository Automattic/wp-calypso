export const breadcrumbSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			label: { type: 'string' },
			href: { type: 'string' },
		},
	},
};
