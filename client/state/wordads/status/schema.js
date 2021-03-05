export const wordadsUnsafeValues = [ false, 'mature', 'private', 'spam', 'other' ];
export const wordadsStatusSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			properties: {
				ID: { type: 'integer' },
				name: { type: 'string' },
				URL: { type: 'string' },
				approved: { type: 'boolean' },
				active: { type: 'boolean' },
				unsafe: { enum: wordadsUnsafeValues },
			},
		},
	},
	additionalProperties: false,
};
