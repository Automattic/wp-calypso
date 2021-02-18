/**
 * /* eslint-disable
 *
 */

export default {
	id: 40,
	status: 'completed',
	currency: 'USD',
	total: '50.87',
	total_tax: '0.00',
	prices_include_tax: false,
	billing: {},
	shipping: {},
	payment_method: 'stripe',
	payment_method_title: 'Credit Card (Stripe)',
	meta_data: [],
	line_items: [
		{
			id: 12,
			name: 'Coffee',
			price: 15.29,
		},
	],
	tax_lines: [],
	shipping_lines: [
		{
			id: 13,
			method_title: 'Flat rate',
			method_id: 'flat_rate:2',
			total: '5.00',
			total_tax: '0.00',
			taxes: [],
		},
	],
};
