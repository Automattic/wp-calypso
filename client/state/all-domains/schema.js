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
			isWPCOMDomain: { type: 'boolean' },
			isWpcomStagingDomain: { type: 'boolean' },
			name: { type: 'string' },
			registrationDate: { type: 'string' },
			type: { type: 'string' },
		},
	},
};
