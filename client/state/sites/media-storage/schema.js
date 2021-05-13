export const itemsSchema = {
	type: 'object',
	patternProperties: {
		//be careful to escape regexes properly
		'^\\d+$': {
			type: 'object',
			required: [ 'max_storage_bytes', 'storage_used_bytes' ],
			properties: {
				max_storage_bytes: { type: [ 'integer' ] },
				storage_used_bytes: { type: [ 'integer' ] },
			},
		},
	},
	additionalProperties: false,
};
