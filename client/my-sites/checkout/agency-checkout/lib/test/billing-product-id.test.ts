import { getBillingProductId } from '../billing-product-id';
import type { AgencyProduct } from '@automattic/api-core';

const wpcomPlan = {
	slug: 'wpcom-hosting-business',
	product_id: 1008,
	monthly_product_id: 1009,
	yearly_product_id: 1008,
	monthly_alternative_product_id: 1011,
	yearly_alternative_product_id: 1010,
} as AgencyProduct;

const backup = {
	slug: 'jetpack-backup-t1',
	product_id: 2112,
	monthly_product_id: 2112,
	yearly_product_id: 2113,
	alternative_product_id: 2010,
} as AgencyProduct;

const pressable = {
	slug: 'pressable-wp-1',
	product_id: 3001,
} as AgencyProduct;

describe( 'getBillingProductId', () => {
	it( 'prefers the agency-specific id of the chosen term', () => {
		expect( getBillingProductId( wpcomPlan, 'yearly' ) ).toBe( 1010 );
		expect( getBillingProductId( wpcomPlan, 'monthly' ) ).toBe( 1011 );
	} );

	it( 'falls back to the shared agency-specific id, then to the term product', () => {
		expect( getBillingProductId( backup, 'monthly' ) ).toBe( 2010 );
		expect( getBillingProductId( pressable, 'yearly' ) ).toBe( 3001 );
		expect( getBillingProductId( { ...pressable, yearly_product_id: 3002 }, 'yearly' ) ).toBe(
			3002
		);
	} );
} );
