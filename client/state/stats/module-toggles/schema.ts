export const schema = {
	type: 'object',
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			patternProperties: {
				// page key, such as 'traffic' or 'insights'
				'^\\w+$': {
					type: 'object',
					patternProperties: {
						// module key, such as 'authors' or 'videos'
						'^\\w+$': { type: 'boolean' },
					},
				},
			},
		},
	},
};
