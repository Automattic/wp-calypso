export const items = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			additionalProperties: false,
			patternProperties: {
				// Post Id
				'^\\d+$': {
					type: 'object',
					additionalProperties: false,
					patternProperties: {
						// Stat Key
						'^[0-9a-zA-Z]+$': { type: 'integer' }
					}
				}
			}
		}
	}
};
