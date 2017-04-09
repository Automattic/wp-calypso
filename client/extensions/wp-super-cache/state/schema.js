export const settingsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object'
		}
	}
};
