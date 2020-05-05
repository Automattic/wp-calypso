export const order = {
	id: 40,
	status: 'completed',
	currency: 'USD',
	total: '50.87',
	total_tax: '0.00',
	prices_include_tax: false,
	billing: {
		first_name: 'Eleanor',
		last_name: 'Smith',
		company: '',
		address_1: '839 Riverside Dr',
		address_2: '',
		city: 'New York',
		state: 'NY',
		postcode: '10032',
		country: 'US',
		email: 'fantastic.fall@gmail.com',
		phone: '444222424',
	},
	shipping: {
		first_name: 'Eleanor',
		last_name: 'Smith',
		company: '',
		address_1: '839 Riverside Dr',
		address_2: '',
		city: 'New York',
		state: 'NY',
		postcode: '10032',
		country: 'US',
	},
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

export const state = {
	ui: { selectedSiteId: 123 },
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: {
						isLoading: {
							40: false,
						},
						items: {
							40: order,
						},
					},
				},
			},
			ui: {
				orders: {
					123: {
						edits: {
							currentlyEditingId: 40,
							changes: {
								billing: {
									first_name: 'Joan',
								},
							},
						},
						list: {
							currentPage: 2,
							currentSearch: 'example',
						},
					},
					234: {
						edits: {},
						list: {
							currentPage: 5,
							currentSearch: 'test',
						},
					},
					345: {
						edits: {
							currentlyEditingId: { placeholder: 'order_1' },
							changes: {
								billing: {
									email: 'test@example.com',
								},
							},
						},
						list: {
							currentPage: 2,
							currentSearch: 'example',
						},
					},
				},
			},
		},
	},
};
