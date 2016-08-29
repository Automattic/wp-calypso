export const storedCardsSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			added: { type: 'string' },
			email: { type: 'string' },
			expiry: { type: 'string' },
			card: { type: 'integer' },
			card_type: { type: 'string' },
			last_service: { type: 'string' },
			last_used: { type: 'string' },
			meta: { type: 'array' },
			mp_ref: { type: 'string' },
			name: { type: 'string' },
			payment_partner: { type: 'string' },
			remember: { type: 'integer' },
			stored_details_id: { type: 'integer' },
			user_id: { type: 'integer' }
		}
	},
	additionalProperties: false
};
