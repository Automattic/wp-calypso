/** @format */

export const jetpackOnboardingCredentialsSchema = {
	type: 'object',
	additionalProperties: false,
	required: [ 'siteUrl', 'token', 'userEmail' ],
	properties: {
		siteUrl: { type: 'string' },
		token: { type: 'string' },
		userEmail: { type: 'string' },
	},
};
