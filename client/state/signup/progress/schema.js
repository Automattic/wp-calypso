/** @format */
export const schema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			formData: {
				type: 'object',
				properties: {
					url: { type: 'string' },
				},
			},
			lastUpdated: { type: 'number' },
			status: { type: 'string' },
			stepName: { type: 'string' },
		},
	},
};
