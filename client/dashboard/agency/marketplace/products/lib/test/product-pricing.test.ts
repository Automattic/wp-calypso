import {
	getProductBillingTerm,
	getProductPriceInfo,
	getTermAvailabilityNote,
	isFreeProduct,
} from '../product-pricing';
import type { AgencyProduct } from '@automattic/api-core';

const product = ( overrides: Partial< AgencyProduct > ): AgencyProduct => ( {
	name: 'Product',
	slug: 'product',
	product_id: 1,
	currency: 'USD',
	family_slug: 'jetpack-products',
	...overrides,
} );

const bothTerms = product( {
	monthly_product_id: 2015,
	yearly_product_id: 2014,
	monthly_price: 24.95,
	yearly_price: 299.4,
} );

const monthlyOnly = product( {
	slug: 'jetpack-backup-addon-storage-10gb-monthly',
	monthly_product_id: 2040,
	monthly_price: 2.95,
} );

const introductory = product( {
	slug: 'pressable-signature-1',
	family_slug: 'pressable-hosting',
	monthly_product_id: 2,
	yearly_product_id: 3,
	monthly_price: 25,
	monthly_introductory_price: 18.75,
	yearly_price: 250,
	yearly_introductory_price: 125,
} );

describe( 'isFreeProduct', () => {
	test( 'is free when neither term has a price', () => {
		expect( isFreeProduct( product( { yearly_product_id: 5, yearly_price: 0 } ) ) ).toBe( true );
		expect( isFreeProduct( bothTerms ) ).toBe( false );
	} );
} );

describe( 'getProductBillingTerm', () => {
	test( 'keeps the selected term when the product is sold on it', () => {
		expect( getProductBillingTerm( bothTerms, 'monthly' ) ).toBe( 'monthly' );
		expect( getProductBillingTerm( bothTerms, 'yearly' ) ).toBe( 'yearly' );
	} );

	test( 'falls back to the other term when the product lacks an id for it', () => {
		expect( getProductBillingTerm( monthlyOnly, 'yearly' ) ).toBe( 'monthly' );
	} );
} );

describe( 'getProductPriceInfo', () => {
	test( 'returns the selected term price', () => {
		expect( getProductPriceInfo( bothTerms, 'yearly' ) ).toEqual( {
			price: 299.4,
			discountPercentage: 0,
			intervalLabel: 'per year',
			billingTerm: 'yearly',
			isFree: false,
		} );
		expect( getProductPriceInfo( bothTerms, 'monthly' ).price ).toBe( 24.95 );
	} );

	test( 'converts the other term price when the product is not sold on the selected term', () => {
		const info = getProductPriceInfo( monthlyOnly, 'yearly' );
		expect( info.price ).toBeCloseTo( 35.4 );
		expect( info ).toMatchObject( {
			discountPercentage: 0,
			intervalLabel: 'per year, billed monthly',
			billingTerm: 'monthly',
			isFree: false,
		} );
	} );

	test( 'applies the introductory price of the selected term', () => {
		expect( getProductPriceInfo( introductory, 'monthly' ) ).toEqual( {
			price: 18.75,
			regularPrice: 25,
			discountPercentage: 25,
			intervalLabel: 'per month',
			billingTerm: 'monthly',
			isFree: false,
		} );
		expect( getProductPriceInfo( introductory, 'yearly' ) ).toMatchObject( {
			price: 125,
			regularPrice: 250,
			discountPercentage: 50,
		} );
	} );

	test( 'can ignore the introductory price', () => {
		expect(
			getProductPriceInfo( introductory, 'monthly', { applyIntroductoryPrice: false } )
		).toEqual( {
			price: 25,
			discountPercentage: 0,
			intervalLabel: 'per month',
			billingTerm: 'monthly',
			isFree: false,
		} );
	} );
} );

describe( 'getTermAvailabilityNote', () => {
	test( 'only notes a term switch for paid products', () => {
		expect( getTermAvailabilityNote( bothTerms, 'yearly' ) ).toBeUndefined();
		expect( getTermAvailabilityNote( monthlyOnly, 'yearly' ) ).toBe(
			'This product is not available for yearly billing. We will bill you monthly instead.'
		);
		expect(
			getTermAvailabilityNote( product( { yearly_product_id: 5, yearly_price: 0 } ), 'monthly' )
		).toBeUndefined();
	} );
} );
