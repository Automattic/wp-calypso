export const usersSchema = {
	type: 'array',
	items: {
		oneOf: [
			{
				type: 'object',
				required: [
					'domain',
					'mailbox',
					'first_name',
					'last_name',
					'product_name',
					'product_slug',
					'provider_slug',
					'site_id',
				],
				properties: {
					domain: { type: 'string' },
					mailbox: { type: 'string' },
					first_name: { type: 'string' },
					last_name: { type: 'string' },
					is_suspended: { type: 'boolean' },
					has_agreed_to_terms: { type: 'boolean' },
					product_name: { type: 'string' },
					product_slug: { type: 'string' },
					provider_slug: { type: 'string' },
					site_id: { type: 'integer' },
				},
			},
			{
				type: 'object',
				required: [ 'domain', 'error', 'product_slug', 'site_id' ],
				properties: {
					domain: { type: 'string' },
					error: { type: 'string' },
					product_slug: { type: 'string' },
					site_id: { type: 'integer' },
				},
			},
		],
	},
};
