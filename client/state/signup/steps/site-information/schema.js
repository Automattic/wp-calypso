/** @format */
export const siteInformationSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		name: {
			type: 'string',
		},
		address: {
			type: 'string',
		},
		phone: {
			type: 'string',
		},
	},
};
