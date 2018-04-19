export default {
	type: 'object',
	properties: {
		application_password: { type: 'string' },
		message: { type: 'string' },
		success: { type: 'boolean' },
	},
	required: [ 'application_password' ],
	additionalProperties: false,
};
