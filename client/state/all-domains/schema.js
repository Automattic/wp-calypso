export const allDomainsSchema = {
	type: 'array',
	items: {
		type: 'object',
		required: [ 'domain' ],
		properties: {
			blogId: { type: 'number' },
			isDomainOnlySite: { type: 'boolean' },
			domain: { type: 'string' },
			expiry: { type: [ 'null', 'string' ] },
			hasRegistration: { type: 'boolean' },
			isWPCOMDomain: { type: 'boolean' },
			isWpcomStagingDomain: { type: 'boolean' },
			name: { type: 'string' },
			registrationDate: { type: 'string' },
			siteSlug: { type: 'string' },
			siteTitle: { type: 'string' },
			type: { type: 'string' },
			currentUserIsOwner: { type: 'boolean' },
		},
	},
};
