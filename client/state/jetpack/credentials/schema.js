export const itemsSchema = {
	type: 'object',
	items: {
		type: 'object',
		properties: {
			abspath: { type: 'string' },
			host: { type: 'string' },
			port: { type: 'number' },
			protocol: { type: 'string' },
			pass: { type: 'boolean' },
			user: { type: 'string' },
		},
	},
};
