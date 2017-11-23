/** @format */

export const onboardingSiteInfoSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		url: { type: 'string' },
		token: { type: 'string' },
	},
};
