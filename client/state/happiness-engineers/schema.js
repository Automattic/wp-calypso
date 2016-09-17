export const itemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^.+$': {
			type: 'object',
			required: [ 'avatar_URL' ],
			properties: {
				avatar_URL: { type: 'string' }
			}
		}
	}
};
