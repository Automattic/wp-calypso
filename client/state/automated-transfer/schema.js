export const automatedTransferStatusSchema = {
	type: 'object',
	properties: {
		status: {
			type: 'string',
			patternProperties: {
				'^\\d+$': { type: 'string' },
			},
		},
	},
};
