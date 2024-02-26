/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import useSitePurchases from '../../queries/use-site-purchases';
import useSitePurchasesByQuery from '../use-site-purchases-by-query';

jest.mock( '../../queries/use-site-purchases' );

describe( 'useSitePurchasesByQuery', () => {
	const mockData = {
		1: { id: 1, productSlug: 'foo' },
		2: { id: 2, productSlug: 'bar' },
		3: { id: 3, productSlug: 'foobar' },
	};

	beforeEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should return undefined when sitePurchases.data is undefined', () => {
		( useSitePurchases as jest.Mock ).mockReturnValue( {} );

		const { result } = renderHook( () => useSitePurchasesByQuery( { query: {} } ) );

		expect( result.current ).toBeUndefined();
	} );

	it( 'should return all purchases when query is empty', () => {
		( useSitePurchases as jest.Mock ).mockReturnValue( { data: mockData } );

		const { result } = renderHook( () => useSitePurchasesByQuery( { query: {} } ) );

		expect( result.current ).toEqual( mockData );
	} );

	it( 'should filter site purchases based on the provided query', () => {
		( useSitePurchases as jest.Mock ).mockReturnValue( { data: mockData } );

		const { result } = renderHook( () =>
			useSitePurchasesByQuery( { query: { productSlug: 'foobar' } } )
		);

		expect( result.current ).toEqual( {
			3: { id: 3, productSlug: 'foobar' },
		} );
	} );

	it( 'should return undefined if no query match', () => {
		( useSitePurchases as jest.Mock ).mockReturnValue( { data: mockData } );

		// No match
		expect(
			renderHook( () => useSitePurchasesByQuery( { query: { productSlug: 'notfoonotbar' } } ) )
				.result.current
		).toEqual( undefined );

		// Partial match
		expect(
			renderHook( () => useSitePurchasesByQuery( { query: { id: 2, productSlug: 'foo' } } ) ).result
				.current
		).toEqual( undefined );
	} );
} );
