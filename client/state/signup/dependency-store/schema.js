export const dependencyStoreSchema = {
	type: 'object',
	properties: {
		cartItem: {
			oneOf: [
				{ type: 'null' },
				{
					type: 'object',
					properties: {
						product_slug: 'string',
						free_trial: 'boolean',
					}
				}
			]
		},
		designType: 'string',
		domainItem: {
			oneOf: [
				{ type: 'null' },
				{
					type: 'object',
					properties: {
						is_domain_registration: 'boolean',
						product_slug: 'string',
						meta: 'string',
					},
				}
			]
		},
		surveyQuestion: 'string',
		surveySiteType: 'string',
		theme: 'string'
	}
};
