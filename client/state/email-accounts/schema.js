export const usersSchema = {
	type: 'array',
	items: {
		oneOf: [
			{
				type: 'object',
				required: [
					'email',
					'mailbox',
					'domain',
					'firstname',
					'lastname',
					'fullname',
					'site_id',
					'suspended',
					'product_name',
					'product_slug',
				],
				properties: {
					mailbox: { type: 'string' },
					domain: { type: 'string' },
					email: { type: 'string' },
					firstname: { type: 'string' },
					lastname: { type: 'string' },
					fullname: { type: 'string' },
					site_id: { type: 'integer' },
					suspended: { type: 'boolean' },
					agreed_to_terms: { type: 'boolean' },
					product_name: { type: 'string' },
					product_slug: { type: 'string' },
				},
			},
			{
				type: 'object',
				required: [ 'domain', 'site_id', 'error', 'product_slug' ],
				properties: {
					error: { type: 'string' },
					domain: { type: 'string' },
					site_id: { type: 'integer' },
					product_slug: { type: 'string' },
				},
			},
		],
	},
};
