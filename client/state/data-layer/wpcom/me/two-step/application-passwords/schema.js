export default {
	type: 'object',
	properties: {
		application_passwords: {
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
		},
	},
	additionalProperties: false,
};
