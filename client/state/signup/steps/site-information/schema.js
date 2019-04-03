/** @format */
export const siteInformationSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		address: {
			type: 'string',
		},
		phone: {
			type: 'string',
		},
		title: {
			type: 'string',
		},
	},
};
