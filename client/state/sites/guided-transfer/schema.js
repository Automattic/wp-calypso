export const guidedTransferStatusSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			properties: {
				issues: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							reason: { type: 'string' },
							prevents_transfer: { type: 'boolean' },
						},
					},
				},
				upgrade_purchased: { type: 'boolean' },
				host_details_entered: { type: 'boolean' },
			},
		}
	}
};
