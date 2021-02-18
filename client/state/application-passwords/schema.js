export const itemsSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			ID: { type: 'integer' },
			generated: { type: 'string' },
			name: { type: 'string' },
		},
		required: [ 'ID', 'generated', 'name' ],
		additionalProperties: false,
	},
};
