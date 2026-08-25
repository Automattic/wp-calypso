/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useProductTermAvailabilityTooltip } from '../use-marketplace';
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
