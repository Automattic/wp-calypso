export const pluginInstructionSchema = {
	type: 'object',
	patternProperties: {
		//be careful to escape regexes properly
		'^[0-9]+$': {
			type: 'array',
			items: {
				required: [ 'slug' ],
				properties: {
					name: { type: 'string' },
					slug: { type: 'string' },
					status: { type: 'string' },
					error: { type: [ 'object', 'string', 'null' ] },

					/* Invalidate state if the key has been persisted */
					key: {
						type: 'null',
					},
				},
			},
		},
	},
	additionalProperties: false,
};
