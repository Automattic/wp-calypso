/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import {
	getWPCOMTieredPrice,
	getWPCOMTierPrices,
	useProductTermAvailabilityTooltip,
} from '../use-marketplace';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

const buildProduct = ( overrides: Partial< APIProductFamilyProduct > = {} ) =>
	( {
		name: 'Test product',
		slug: 'test-product',
		product_id: 1,
		yearly_product_id: 1,
		currency: 'USD',
		amount: '10',
		price_interval: 'month',
		family_slug: 'test-family',
		supported_bundles: [],
		yearly_price: 120,
		...overrides,
	} ) as APIProductFamilyProduct;

describe( 'useProductTermAvailabilityTooltip', () => {
	it( 'warns about yearly billing for a paid product without monthly pricing', () => {
		const { result } = renderHook( () => useProductTermAvailabilityTooltip( 'monthly' ) );

		expect( result.current( buildProduct() ) ).toBe(
			'This product is not available for monthly billing. We will bill you yearly instead.'
		);
	} );

	it( 'warns about monthly billing for a paid product without yearly pricing', () => {
		const { result } = renderHook( () => useProductTermAvailabilityTooltip( 'yearly' ) );

		const product = buildProduct( {
			yearly_product_id: undefined,
			monthly_product_id: 1,
			yearly_price: undefined,
			monthly_price: 10,
		} );

		expect( result.current( product ) ).toBe(
			'This product is not available for yearly billing. We will bill you monthly instead.'
		);
	} );

	it( 'stays silent for a free product', () => {
		const { result } = renderHook( () => useProductTermAvailabilityTooltip( 'monthly' ) );

		const freeProduct = buildProduct( {
			amount: '0',
			yearly_price: 0,
			monthly_price: 0,
		} );

		expect( result.current( freeProduct ) ).toBeUndefined();
	} );

	it( 'stays silent for a free product with no term prices at all', () => {
		const { result } = renderHook( () => useProductTermAvailabilityTooltip( 'monthly' ) );

		const freeProduct = buildProduct( {
			amount: '0',
			yearly_price: undefined,
			monthly_price: undefined,
		} );

		expect( result.current( freeProduct ) ).toBeUndefined();
	} );

	it( 'keeps the warning for a paid product whose amount is formatted with a separator', () => {
		const { result } = renderHook( () => useProductTermAvailabilityTooltip( 'monthly' ) );

		const product = buildProduct( { amount: '1,200', yearly_price: undefined } );

		expect( result.current( product ) ).toBe(
			'This product is not available for monthly billing. We will bill you yearly instead.'
		);
	} );
} );

describe( 'WordPress.com promotions', () => {
	const promotion = { price: 198, discount: 25, ends_at: '2999-12-12T00:00:00+00:00' };
	const wpcom = ( overrides: Partial< APIProductFamilyProduct > = {} ) =>
		buildProduct( {
			family_slug: 'wpcom-hosting',
			yearly_price: 264,
			tier_yearly_prices: [
				{ units: 2, price: 264, promotional_price: 198 },
				{ units: 4, price: 158.5, promotional_price: 118.87 },
			],
			...overrides,
		} );

	it( 'prices every tier, including a single site, at its promotional price', () => {
		expect(
			getWPCOMTierPrices( wpcom( { yearly_promotion: promotion } ), 'yearly' ).map(
				( tier ) => tier.pricePerUnit
			)
		).toEqual( [ 198, 198, 118.87 ] );
	} );

	it( 'prices the promotion like checkout, off the line total', () => {
		// 4 × 118.87 would be 475.48; checkout charges 25% off 634.
		expect( getWPCOMTieredPrice( wpcom( { yearly_promotion: promotion } ), 4, 'yearly' ) ).toEqual(
			{
				actualCost: 1056,
				discountedCost: 475.5,
				discountPercentage: 55,
				promotion,
			}
		);
	} );

	it( 'ignores promotional tier prices once the promotion has ended', () => {
		const ended = { ...promotion, ends_at: '2000-01-01T00:00:00+00:00' };
		const pricing = getWPCOMTieredPrice( wpcom( { yearly_promotion: ended } ), 4, 'yearly' );

		expect( pricing.discountedCost ).toBe( 634 );
		expect( pricing.promotion ).toBeUndefined();
	} );
} );
