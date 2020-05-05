export default {
	line_items: [
		{
			id: 26,
			name: 'Mug',
			price: 11.64,
			quantity: 2,
			subtotal: 31.98,
			total: 23.28,
			taxes: [
				{
					id: 4,
					total: '1.4784',
					subtotal: '2.0307',
				},
			],
		},
		{
			id: 27,
			name: 'Scarf - Blue',
			price: 36.39,
			quantity: 1,
			subtotal: 49.99,
			total: 36.39,
			taxes: [
				{
					id: 4,
					total: '2.3109',
					subtotal: '3.1744',
				},
			],
		},
	],
	tax_lines: [
		{
			id: 29,
			rate_code: 'US-CT-CT TAX-1',
			rate_id: 4,
			label: 'CT Tax',
			compound: false,
			tax_total: '3.78',
			shipping_tax_total: '0.64',
		},
	],
	shipping_lines: [
		{
			id: 28,
			method_title: 'USPS',
			method_id: 'fallback:0:0',
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
	fee_lines: [
		{
			id: 40,
			name: 'fee',
			amount: '5.00',
			total: '5.00',
			total_tax: '0.31',
			taxes: [
				{
					id: 1,
					total: '0.3125',
					subtotal: '',
				},
			],
		},
		{
			id: 41,
			name: 'additional fee',
			amount: '10.00',
			total: '10.00',
			total_tax: '0.63',
			taxes: [
				{
					id: 1,
					total: '0.625',
					subtotal: '',
				},
			],
		},
	],
	coupon_lines: [
		{
			id: 30,
			code: 'store-launch',
			discount: '12.3',
			discount_tax: '0.78',
		},
		{
			id: 31,
			code: 'additional-discount',
			discount: '10',
			discount_tax: '0.64',
		},
	],
	refunds: [
		{
			id: 33,
			refund: '',
			total: '-10.00',
		},
	],
};
