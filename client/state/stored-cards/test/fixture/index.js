export const STORED_CARDS_FROM_API = [
	{
		user_id: '12345678',
		stored_details_id: '1234567',
		expiry: '2016-01-31',
		card: '1234',
		card_type: 'visa',
		mp_ref: '8qkGjuMJJbRhyrwq8qkGjuMJJbRhyrwq',
		payment_partner: 'moneypress',
		name: 'John Doe',
		email: 'john@example.com',
		remember: '1',
		meta: [],
		added: '2015-10-22 11:14:05',
		last_used: '2015-10-22 11:14:05',
	},
	{
		user_id: '12345678',
		stored_details_id: '12345',
		expiry: '2016-11-30',
		card: '2596',
		card_type: 'amex',
		mp_ref: 'Cb9S1bxEZDhl20cfCb9S1bxEZDhl20cf',
		payment_partner: 'moneypress',
		name: 'Jane Doe',
		email: 'jane@example.com',
		remember: '1',
		meta: [],
		added: '2015-02-06 20:28:11',
		last_used: '2015-10-22 11:10:10',
	},
	{
		user_id: '12345678',
		stored_details_id: '456',
		expiry: '2016-11-30',
		card: '',
		card_type: '',
		mp_ref: 'Cb9S1bxEZDhl20cfCb9S1bxEZDhl20cf',
		payment_partner: 'paypal_express',
		name: 'Jane Doe',
		email: 'jane@example.com',
		remember: '1',
		meta: [],
		added: '2015-02-06 20:28:11',
		last_used: '2015-10-22 11:10:10',
	},
	{
		user_id: '12345678',
		stored_details_id: '789',
		expiry: '2016-11-30',
		card: '',
		card_type: '',
		mp_ref: 'Cb9S1bxEZDhl20cfCb9S1bxEZDhl20cf',
		payment_partner: 'paypal_express',
		name: 'Jane Doe',
		email: 'jane@example.com',
		remember: '1',
		meta: [],
		added: '2015-02-06 20:28:11',
		last_used: '2015-10-22 11:10:10',
	},
];

export const SELECTED_STORED_CARDS = [
	{
		...STORED_CARDS_FROM_API[ 0 ],
		allStoredDetailsIds: [ STORED_CARDS_FROM_API[ 0 ].stored_details_id ],
	},
	{
		...STORED_CARDS_FROM_API[ 1 ],
		allStoredDetailsIds: [ STORED_CARDS_FROM_API[ 1 ].stored_details_id ],
	},
];

export const SELECTED_PAYMENT_AGREEMENTS = [
	{
		...STORED_CARDS_FROM_API[ 2 ],
		allStoredDetailsIds: [ STORED_CARDS_FROM_API[ 2 ].stored_details_id ],
	},
	{
		...STORED_CARDS_FROM_API[ 3 ],
		allStoredDetailsIds: [ STORED_CARDS_FROM_API[ 3 ].stored_details_id ],
	},
];

export const SELECTED_UNIQUE_PAYMENT_AGREEMENTS = [
	{
		...STORED_CARDS_FROM_API[ 2 ],
		allStoredDetailsIds: [
			STORED_CARDS_FROM_API[ 2 ].stored_details_id,
			STORED_CARDS_FROM_API[ 3 ].stored_details_id,
		],
	},
];
