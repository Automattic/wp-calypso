import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

export const createBaseTransaction = (): BillingTransaction => ( {
	id: 'mock-transaction',
	date: '2023-01-01',
	service: 'WordPress.com',
	amount: '$10.00',
	amount_integer: 1000,
	currency: 'USD',
	items: [
		{
			id: 'mock-item',
			type: 'new purchase',
			product: 'WordPress.com Plan',
			domain: 'example.com',
			variation: 'Standard',
			type_localized: '',
			site_id: '',
			subtotal: '',
			raw_subtotal: 0,
			subtotal_integer: 0,
			tax: '',
			raw_tax: 0,
			tax_integer: 0,
			amount: '',
			raw_amount: 0,
			amount_integer: 0,
			cost_overrides: [],
			currency: '',
			licensed_quantity: null,
			new_quantity: null,
			volume: null,
			product_slug: '',
			variation_slug: '',
			months_per_renewal_interval: 0,
			wpcom_product_slug: '',
		},
	],
	address: '',
	tax_country_code: '',
	cc_email: '',
	cc_name: '',
	cc_num: '',
	cc_type: '',
	cc_display_brand: null,
	credit: '',
	desc: '',
	icon: '',
	org: '',
	pay_part: '',
	pay_ref: '',
	subtotal: '',
	subtotal_integer: 0,
	support: '',
	tax: '',
	tax_integer: 0,
	url: '',
} );

export const generateTransactions = ( count: number ): BillingTransaction[] => {
	return Array.from( { length: count }, ( _, index ) => ( {
		...createBaseTransaction(),
		id: `transaction-${ index + 1 }`,
	} ) );
};

// Sample transactions with different properties for filtering/sorting tests
export const mockTransactions: BillingTransaction[] = [
	{
		...createBaseTransaction(),
		id: 'wp-premium',
		service: 'WordPress.com',
		amount: '$20.00',
		amount_integer: 2000,
		date: '2023-01-15',
		items: [
			{
				...createBaseTransaction().items[ 0 ],
				id: 'wp-premium-item',
				type: 'new purchase',
				product: 'WordPress.com Premium Plan',
				variation: 'Premium',
			},
		],
	},
	{
		...createBaseTransaction(),
		id: 'jp-backup',
		service: 'Jetpack',
		amount: '$15.00',
		amount_integer: 1500,
		date: '2023-02-01',
		items: [
			{
				...createBaseTransaction().items[ 0 ],
				id: 'jp-backup-item',
				type: 'renewal',
				product: 'Jetpack Backup',
				variation: 'Daily',
			},
		],
	},
	{
		...createBaseTransaction(),
		id: 'woo-basic',
		service: 'Store Services',
		amount: '$25.00',
		amount_integer: 2500,
		date: '2023-03-01',
		items: [
			{
				...createBaseTransaction().items[ 0 ],
				id: 'woo-basic-item',
				type: 'cancellation',
				product: 'WooCommerce Plan',
				variation: 'Basic',
			},
		],
	},
];
