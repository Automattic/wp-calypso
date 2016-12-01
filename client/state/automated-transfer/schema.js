export const automatedTransferStatusSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			properties: {
				status: { type: 'string' },
			},
		}
	},
};
