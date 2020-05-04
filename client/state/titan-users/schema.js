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
					'agreed_to_terms',
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
				},
			},
			{
				type: 'object',
				required: [ 'domain', 'site_id', 'error' ],
				properties: {
					error: { type: 'string' },
					domain: { type: 'string' },
					site_id: { type: 'integer' },
				},
			},
		],
	},
};
