export default {
	line_items: [
		{
			id: 15,
			name: 'Scarf - Striped',
			price: 42.49,
			quantity: 1,
			subtotal: 49.99,
			total: 42.49,
			taxes: [
				{
					id: 4,
					total: '5.3964',
					subtotal: '6.3487',
				},
			],
		},
		{
			id: 19,
			name: 'T-Shirt',
			price: 17.99,
			quantity: 1,
			subtotal: 17.99,
			total: 17.99,
			taxes: [
				{
					id: 4,
					total: '1.1424',
					subtotal: '1.1424',
				},
			],
		},
	],
	tax_lines: [
		{
			id: 17,
			rate_code: 'US-CT-CT TAX-1',
			rate_id: 4,
			label: 'CT Tax',
			compound: false,
			tax_total: '6.54',
			shipping_tax_total: '0.64',
		},
	],
	shipping_lines: [
		{
			id: 16,
			method_title: 'USPS',
			method_id: 'usps:3:0',
			total: '10.00',
			total_tax: '0.64',
			taxes: [
				{
					id: 4,
					total: '0.635',
					subtotal: '',
				},
			],
		},
	],
	fee_lines: [],
	coupon_lines: [
		{
			id: 18,
			code: 'store-launch',
			discount: '15',
			discount_tax: '0.95',
		},
	],
	refunds: [
		{
			id: 23,
			refund: '',
			total: '-20.00',
		},
		{
			id: 24,
			refund: 'A note',
			total: '-5.00',
		},
	],
};
