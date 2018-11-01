/** @format */
export const siteInformationSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		address: {
			type: 'string',
		},
		email: {
			type: 'string',
		},
		phone: {
			type: 'string',
		},
	},
};
