/** @format */
export const forwardsSchema = {
	type: 'array',
	items: {
		type: 'object',
		required: [ 'email', 'mailbox', 'domain', 'forward_address' ],
		properties: {
			email: { type: 'string' },
			mailbox: { type: 'string' },
			domain: { type: 'string' },
			forward_address: { type: 'string' },
			active: { type: 'boolean' },
			temporary: { type: 'boolean' },
			created: { type: 'integer' },
		},
	},
};
