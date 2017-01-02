export default {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site ID
		'^\\d+$': {
			type: 'object',
			additionalProperties: false,
			patternProperties: {
				// Post ID
				'^\\d+$': {
					type: 'array',
					description: 'List of post\'s likes.'
				}
			}
		}
	}
};
