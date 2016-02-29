export const themeDetailsSchema = {
	type: 'object',
	patternProperties: {
		//be careful to escape regexes properly
		'^\\S+$': {
			type: 'object',
			required: [ 'name', 'author' ],
			properties: {
				name: { type: 'string' },
				author: { type: 'string' }
			}
		}
	},
	additionalProperties: false
};
