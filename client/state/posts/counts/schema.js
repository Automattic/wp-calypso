export const countsSchema = {
	type: 'object',
	patternProperties: {
		'^[0-9]+$': {
			type: 'object',
			patternProperties: {
				'^[A-Za-z0-9]+$': {
					type: 'object',
					patternProperties: {
						'^(all|mine)$': {
							type: 'object',
							patternProperties: {
								'^[A-Za-z0-9]+$': {
									type: 'integer'
								}
							},
							additionalProperties: false
						}
					},
					additionalProperties: false
				}
			},
			additionalProperties: false
		}
	},
	additionalProperties: false
};
