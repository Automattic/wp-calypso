/**
 * /* eslint-disable
 *
 * @format
 */

export default {
	line_items: [
		{
			id: 26,
			name: 'Mug',
			product_id: 71,
			taxes: [
				{
					id: 4,
					total: '1.4784',
					subtotal: '2.0307',
				},
			],
			price: 11.6408,
		},
		{
			id: 27,
			name: 'Scarf - Blue',
			taxes: [
				{
					id: 4,
					total: '2.3109',
					subtotal: '3.1744',
				},
			],
			price: 36.3929,
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
	fee_lines: [],
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
	refunds: [],
};
