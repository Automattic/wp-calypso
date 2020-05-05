export const countsSchema = {
	type: 'object',
	patternProperties: {
		'^[0-9]+$': {
			type: 'object',
			patternProperties: {
				'^[\\w-]+$': {
					type: 'object',
					patternProperties: {
						'^(all|mine)$': {
							type: 'object',
							patternProperties: {
								'^\\w+$': {
									type: 'integer',
								},
							},
							additionalProperties: false,
						},
					},
					additionalProperties: false,
				},
			},
			additionalProperties: false,
		},
	},
	additionalProperties: false,
};
