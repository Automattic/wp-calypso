export const currentThemeSchema = {
	type: 'object',
	properties: {
		isActivating: { type: 'boolean' },
		hasActivated: { type: 'boolean' },
		currentThemes: {
			type: 'object',
			patternProperties: {
				//be careful to escape regexes properly
				'^\\d+$': {
					type: 'object',
					properties: {
						name: { type: 'string' },
						id: { type: 'string' },
						cost: { type: 'object' }
					}
				}
			},
			additionalProperties: false
		}
	}
};
