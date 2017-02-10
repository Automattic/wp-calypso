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

export const requestsSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			patternProperties: {
				'^[A-Za-z]+$': {
					type: 'object',
					patternProperties: {
						'^\\{[^\\}]*\\}$': {
							type: 'object',
							properties: {
								requesting: { type: 'boolean' },
								status: { type: 'string' },
								date: { type: 'string' }
							}
						}
					}
				}
			},
			additionalProperties: false
		}
	},
	additionalProperties: false
};
