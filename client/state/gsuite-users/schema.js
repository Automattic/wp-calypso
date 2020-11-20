export const usersSchema = {
	type: 'array',
	items: {
		oneOf: [
			{
				type: 'object',
				required: [
					'agreed_to_terms',
					'domain',
					'email',
					'firstname',
					'fullname',
					'is_admin',
					'lastname',
					'mailbox',
					'site_id',
					'suspended',
				],
				properties: {
					agreed_to_terms: { type: 'boolean' },
					domain: { type: 'string' },
					email: { type: 'string' },
					firstname: { type: 'string' },
					fullname: { type: 'string' },
					is_admin: { type: 'boolean' },
					lastname: { type: 'string' },
					mailbox: { type: 'string' },
					site_id: { type: 'integer' },
					suspended: { type: 'boolean' },
				},
			},
			{
				type: 'object',
				required: [ 'domain', 'site_id', 'error' ],
				properties: {
					domain: { type: 'string' },
					error: { type: 'string' },
					site_id: { type: 'integer' },
				},
			},
		],
	},
};
