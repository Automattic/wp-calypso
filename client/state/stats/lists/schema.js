export const itemSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			patternProperties: {
				'^[A-Za-z]+$': {
					type: 'object',
					patternProperties: {
						'^\\{[^\\}]*\\}$': {
							type: 'object'
						}
					}
				}
			},
			additionalProperties: false
		}
	},
	additionalProperties: false
};
