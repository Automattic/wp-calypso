export const allDomainsSchema = {
	type: 'array',
	items: {
		type: 'object',
		required: [ 'domain' ],
		properties: {
			blogId: { type: 'number' },
			domain: { type: 'string' },
			expiry: { type: [ 'null', 'string' ] },
			hasRegistration: { type: 'boolean' },
			isWpcomStagingDomain: { type: 'boolean' },
			registrationDate: { type: 'string' },
			type: { type: 'string' },
		},
	},
};
