export const items = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			additionalProperties: false,
			patternProperties: {
				// Video Id
				'^\\d+$': {
					type: 'array'
				}
			}
		}
	}
};
