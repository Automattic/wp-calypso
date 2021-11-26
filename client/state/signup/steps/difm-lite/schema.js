export const difmLiteSchema = {
	type: 'object',
	description: 'The state details for the DIFM onboarding',
	properties: {
		selectedDIFMCategory: {
			description: 'The selected site category',
			type: 'string',
		},
		typeformResponseId: {
			description: 'The response id of the submitted typeform endpoint',
			type: 'string',
		},
	},
};
