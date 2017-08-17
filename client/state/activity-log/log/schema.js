export const logItemsSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'array',
			items: {
				type: 'object',
				required: [
					'name',
					'ts_utc',
				],
				properties: {
					actor: { type: 'object' },
					group: { type: 'string' },
					name: { type: 'string' },
					object: { type: 'object' },
					ts_utc: { type: 'integer' },
				},
			}
		},
	},
	additionalProperties: false,
};
