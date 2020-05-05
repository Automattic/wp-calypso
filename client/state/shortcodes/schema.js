export const shortcodesSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			patternProperties: {
				'^.+$': {
					type: 'object',
					properties: {
						result: { type: 'string' },
						shortcode: { type: 'string' },
						scripts: { type: 'object' },
						styles: { type: 'object' },
					},
				},
			},
		},
	},
};
