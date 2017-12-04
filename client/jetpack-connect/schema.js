/** @format */
export const authorizeQueryDataSchema = {
	type: 'object',
	verbose: true,
	required: [ 'redirect_uri' ],
	properties: {
		redirect_uri: {
			type: 'string',
		},
	},
};
