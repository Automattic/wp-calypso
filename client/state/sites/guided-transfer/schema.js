export const guidedTransferStatusSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			properties: {
				upgrade_purchased: { type: 'boolean' },
				host_details_entered: { type: 'boolean' },
			},
		}
	}
};
