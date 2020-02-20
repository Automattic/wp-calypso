export const domainTransferSchema = {
	type: 'object',
	patternProperties: {
		saveStatus: { type: 'string' },
		selectedRegistrar: { type: 'object' },
	},
};
