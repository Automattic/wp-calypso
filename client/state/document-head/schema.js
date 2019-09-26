export const titleSchema = {
	type: 'string',
};

export const unreadCountSchema = {
	type: 'number',
};

export const metaSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			name: { type: 'string' },
			property: { type: 'string' },
			content: { type: 'string' },
		},
	},
};

export const linkSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			href: { type: 'string' },
			rel: { type: 'string' },
		},
	},
};
