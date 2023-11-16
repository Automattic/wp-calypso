export const dependencyStoreSchema = {
	type: 'object',
	properties: {
		cartItem: {
			OneOfType: [
				{ type: 'null' },
				{ type: 'optional' },
				{
					type: 'object',
					properties: {
						product_slug: { type: 'string' },
						free_trial: { type: 'boolean' },
					},
				},
			],
		},
		designType: { type: 'string' },
		domainItem: {
			OneOfType: [
				{ type: 'null' },
				{ type: 'optional' },
				{
					type: 'object',
					properties: {
						is_domain_registration: { type: 'boolean' },
						product_slug: { type: 'string' },
						meta: { type: 'string' },
					},
				},
			],
		},
		selectedDesign: {
			fonts: {
				headings: { type: 'string' },
				base: { type: 'string' },
			},
			slug: { type: 'string' },
			template: { type: 'string' },
			theme: { type: 'string' },
		},
		theme: { type: 'string' },
		signupDomainOrigin: { type: 'string' },
	},
};
