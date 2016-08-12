export const wordadsUnsafeValues = [ false, 'mature', 'private', 'spam', 'other' ];
export const wordadsStatusSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			required: [ 'ID' ],
			properties: {
				ID: { type: 'integer' },
				name: { type: 'string' },
				URL: { type: 'string' },
				approved: { type: 'boolean' },
				active: { type: 'boolean' },
				unsafe: wordadsUnsafeValues,
			}
		}
	},
	additionalProperties: false
};
