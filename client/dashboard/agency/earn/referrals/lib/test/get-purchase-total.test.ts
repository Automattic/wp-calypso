import { getPurchaseTotal } from '../get-purchase-total';
import type { AgencyProduct, ReferralPurchase } from '@automattic/api-core';

const products: AgencyProduct[] = [
	{
		name: 'Jetpack Complete',
		slug: 'jetpack-complete',
		family_slug: 'jetpack-packs',
		product_id: 2014,
		monthly_product_id: 2015,
		yearly_product_id: 2014,
		currency: 'USD',
		monthly_price: 24.95,
		yearly_price: 299.4,
	},
	{
		name: 'Backup storage',
		slug: 'jetpack-backup-addon-storage-10gb-monthly',
		family_slug: 'jetpack-backup-storage',
		product_id: 2040,
		monthly_product_id: 2040,
		currency: 'USD',
		monthly_price: 2.95,
	},
	{
		name: 'WooPayments',
		slug: 'woocommerce-woopayments',
		family_slug: 'woocommerce-products',
		product_id: 2751,
		yearly_product_id: 2751,
		currency: 'USD',
		yearly_price: 0,
	},
];

const purchase = ( overrides: Partial< ReferralPurchase > ): ReferralPurchase =>
	( {
		status: 'pending',
		product_id: 2014,
		quantity: 1,
		...overrides,
	} ) as ReferralPurchase;

describe( 'getPurchaseTotal', () => {
	test( 'prefers the subscription price once the client has paid', () => {
		expect(
			getPurchaseTotal(
				purchase( {
					subscription: {
						id: '1',
						product_name: 'Jetpack Complete',
						purchase_price: '10',
						purchase_currency: 'EUR',
						billing_interval_unit: 'year',
						status: 'active',
						is_auto_renew_enabled: true,
					},
				} ),
				products
			)
		).toBe( '€10.00/yr' );
	} );

	test( 'falls back to the catalog price for the term the referral was created on', () => {
		expect( getPurchaseTotal( purchase( { product_id: 2014 } ), products ) ).toBe( '$299.40/yr' );
		expect( getPurchaseTotal( purchase( { product_id: 2015 } ), products ) ).toBe( '$24.95/mo' );
		expect( getPurchaseTotal( purchase( { product_id: 2040 } ), products ) ).toBe( '$2.95/mo' );
	} );

	test( 'returns nothing for free or unknown products', () => {
		expect( getPurchaseTotal( purchase( { product_id: 2751 } ), products ) ).toBeNull();
		expect( getPurchaseTotal( purchase( { product_id: 1 } ), products ) ).toBeNull();
		expect( getPurchaseTotal( purchase( {} ), undefined ) ).toBeNull();
	} );
} );
