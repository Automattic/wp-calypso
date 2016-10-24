export const pluginInstructionSchema = {
	type: 'object',
	patternProperties: {
		//be careful to escape regexes properly
		'^[0-9]+$': {
			type: 'array',
			items: {
				required: [ 'slug', 'key' ],
				properties: {
					name: { type: 'string' },
					slug: { type: 'string' },
					key: { type: 'string' },
					status: { type: 'string' },
					error: { type: [ 'object', 'string', 'null' ] },
				}
			}
		}
	},
	additionalProperties: false
};
