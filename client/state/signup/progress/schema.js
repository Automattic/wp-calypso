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
			// Valid status values: 'completed', 'processing', 'pending', and 'in-progress'
			status: { type: 'string' },
			stepName: { type: 'string' },
		},
	},
};
