export const storedCardsSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			added: { type: 'string' },
			email: { type: 'string' },
			expiry: { type: 'string' },
			card: { type: 'string' },
			card_type: { type: 'string' },
			last_service: { type: 'string' },
			last_used: { type: 'string' },
			meta: { type: 'array' },
			mp_ref: { type: 'string' },
			name: { type: 'string' },
			payment_partner: { type: 'string' },
			remember: { type: 'string' },
			stored_details_id: { type: 'string' },
			user_id: { type: 'string' },
		},
	},
	additionalProperties: false,
};
