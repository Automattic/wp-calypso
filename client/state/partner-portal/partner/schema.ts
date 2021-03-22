export const activePartnerKeySchema = {
	type: 'number',
};

export const currentPartnerSchema = {
	type: 'object',
	additionalProperties: true,
	required: [ 'id', 'slug' ],
	patternProperties: {
		'^\\d+$': {
			id: { type: 'number' },
			name: { type: 'string' },
			slug: { type: 'string' },
			keys: {
				type: [ 'array', 'null' ],
				items: {
					type: 'object',
					required: [ 'id', 'oAuthToken' ],
					properties: {
						id: { type: 'number' },
						disabledOn: { type: [ 'null', 'string' ] },
						name: { type: 'string' },
						oAuthToken: { type: 'string' },
					},
				},
			},
		},
	},
};
