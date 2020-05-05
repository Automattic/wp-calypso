/**
 * /* eslint-disable
 *
 */

export default [
	{
		id: 35,
		status: 'processing',
		currency: 'USD',
		total: '15.00',
		total_tax: '0.00',
		prices_include_tax: false,
		billing: {},
		shipping: {},
		payment_method: 'cheque',
		payment_method_title: 'Check payments',
		meta_data: [],
		line_items: [
			{
				id: 3,
				name: 'Watercolor Painting',
				price: 10,
			},
		],
		tax_lines: [],
		shipping_lines: [
			{
				id: 4,
				method_title: 'Flat rate',
				method_id: 'flat_rate:2',
				total: '5.00',
				total_tax: '0.00',
				taxes: [],
			},
		],
	},
	{
		id: 26,
		status: 'on-hold',
		currency: 'USD',
		total: '15.00',
		total_tax: '0.00',
		prices_include_tax: false,
		billing: {},
		shipping: {},
		payment_method: 'stripe',
		payment_method_title: 'Credit Card (Stripe)',
		meta_data: [],
		line_items: [
			{
				id: 2,
				name: 'Coffee',
				price: 10,
			},
		],
		tax_lines: [],
		shipping_lines: [
			{
				id: 2,
				method_title: 'Flat rate',
				method_id: 'flat_rate:2',
				total: '5.00',
				total_tax: '0.00',
				taxes: [],
			},
		],
	},
];
