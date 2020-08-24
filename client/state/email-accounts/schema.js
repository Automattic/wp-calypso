export default {
	type: 'array',
	items: {
		oneOf: [
			{
				type: 'object',
				required: [
					'domain_name',
					'product_name',
					'product_slug',
					'product_type',
					'site_id',
					'mailboxes',
				],
				properties: {
					domain_name: { type: 'string' },
					product_name: { type: 'string' },
					product_slug: { type: 'string' },
					product_type: { type: 'string' },
					site_id: { type: 'integer' },
					mailboxes: {
						type: 'array',
						items: {
							type: 'object',
							required: [ 'name', 'first_name', 'last_name', 'state' ],
							properties: {
								name: { type: 'string' },
								first_name: { type: 'string' },
								last_name: { type: 'string' },
								state: { type: 'string', enum: [ 'active', 'suspended' ] },
								meta: { type: 'object' },
							},
						},
					},
				},
			},
			{
				type: 'object',
				required: [ 'domain_name', 'error', 'product_slug', 'site_id' ],
				properties: {
					domain_name: { type: 'string' },
					error: { type: 'string' },
					product_slug: { type: 'string' },
					site_id: { type: 'integer' },
				},
			},
		],
	},
};
