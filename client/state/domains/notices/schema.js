export const domainNoticesStatusSchema = {
	type: 'object',
	patternProperties: {
		saveStatus: { type: 'string' },
		selectedRegistrar: { type: 'object' },
	},
};
