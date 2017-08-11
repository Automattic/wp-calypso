export const rewindSetCredentialsSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			required: [ 'ok', 'error' ],
			properties: {
				ok: { type: 'boolean' },
				error: { type: 'string' },
			},
		},
	},
	additionalProperties: false,
};
