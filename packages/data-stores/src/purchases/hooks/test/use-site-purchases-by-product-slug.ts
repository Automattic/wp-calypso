/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import useSitePurchases from '../../queries/use-site-purchases';
import useSitePurchasesByProductSlug from '../use-site-purchases-by-product-slug';

jest.mock( '../../queries/use-site-purchases' );

describe( 'useSitePurchasesByProductSlug', () => {
	const mockData = {
		1: { id: 1, productSlug: 'foo' },
		2: { id: 2, productSlug: 'bar' },
		3: { id: 3, productSlug: 'foo' },
	};

	beforeEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should return undefined when sitePurchases.data is undefined', () => {
		( useSitePurchases as jest.Mock ).mockReturnValue( {} );

		const { result } = renderHook( () =>
			useSitePurchasesByProductSlug( { siteId: 1, productSlug: 'foo' } )
		);

		expect( result.current ).toBeUndefined();
	} );

	it( 'should filter site purchases based on the provided slug', () => {
		( useSitePurchases as jest.Mock ).mockReturnValue( { data: mockData } );

		const { result } = renderHook( () =>
			useSitePurchasesByProductSlug( { siteId: 1, productSlug: 'foo' } )
		);

		expect( result.current ).toEqual( {
			1: { id: 1, productSlug: 'foo' },
			3: { id: 3, productSlug: 'foo' },
		} );
	} );

	it( 'should return null if no match', () => {
		( useSitePurchases as jest.Mock ).mockReturnValue( { data: mockData } );

		// No match
		expect(
			renderHook( () =>
				useSitePurchasesByProductSlug( { siteId: 1, productSlug: 'notfoonotbar' } )
			).result.current
		).toEqual( null );

		// Undefined product slug
		expect(
			renderHook( () => useSitePurchasesByProductSlug( { siteId: 1, productSlug: undefined } ) )
				.result.current
		).toEqual( null );
	} );
} );
