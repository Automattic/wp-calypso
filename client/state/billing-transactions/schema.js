export const billingTransactionsSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		past: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: { type: 'string' },
					service: { type: 'string' },
					amount: { type: 'string' },
					tax_amount: { type: 'string' },
					icon: { type: 'string' },
					date: { type: 'string' },
					desc: { type: 'string' },
					org: { type: 'string' },
					url: { type: 'string' },
					support: { type: 'string' },
					pay_ref: { type: 'string' },
					pay_part: { type: 'string' },
					cc_type: { type: 'string' },
					cc_num: { type: 'string' },
					cc_name: { type: 'string' },
					cc_email: { type: 'string' },
					credit: { type: 'string' },
					items: {
						type: 'array',
						items: {
							type: 'object',
						},
					},
				},
			},
		},
		upcoming: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: { type: 'string' },
					blog_id: { type: 'string' },
					plan: { type: 'string' },
					amount: { type: 'string' },
					tax_amount: { type: 'string' },
					date: { type: 'string' },
					product: { type: 'string' },
					interval: { type: 'string' },
					icon: { type: 'string' },
					domain: { type: [ 'string', 'null' ] },
				},
			},
		},
	},
};
