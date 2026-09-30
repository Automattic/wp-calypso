/**
 * @jest-environment jsdom
 */
import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { useShoppingCart } from '@automattic/shopping-cart';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import useSitePlanCart from '../use-site-plan-cart';
import type { Agency, AgencyProduct } from '@automattic/api-core';
import type { PropsWithChildren } from 'react';

jest.mock( '@automattic/shopping-cart', () => ( {
	...jest.requireActual( '@automattic/shopping-cart' ),
	useShoppingCart: jest.fn(),
} ) );

const AGENCY_ID = 42;
const SITE_ID = 1234;
const products = [
	{
		slug: 'wpcom-hosting-business',
		product_id: 1008,
		monthly_product_id: 1009,
		yearly_product_id: 1008,
		monthly_alternative_product_id: 1011,
		yearly_alternative_product_id: 1010,
	},
] as AgencyProduct[];

const replaceProductsInCart = jest.fn();

function renderCart( productSlug: string, term: 'monthly' | 'yearly' = 'yearly' ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( activeAgencyQuery().queryKey, { id: AGENCY_ID } as Agency );
	queryClient.setQueryData( agencyProductsQuery( AGENCY_ID ).queryKey, products );

	return renderHook( () => useSitePlanCart( SITE_ID, productSlug, term ), {
		wrapper: ( { children }: PropsWithChildren ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		),
	} );
}

describe( 'useSitePlanCart', () => {
	beforeEach( () => {
		replaceProductsInCart.mockReset().mockResolvedValue( {} );
		( useShoppingCart as jest.Mock ).mockReset().mockReturnValue( { replaceProductsInCart } );
	} );

	it( 'puts the plan of the chosen term in the site’s own cart as a development site checkout', async () => {
		const { result } = renderCart( 'wpcom-hosting-business', 'monthly' );

		await waitFor( () => expect( result.current.isReady ).toBe( true ) );

		expect( useShoppingCart ).toHaveBeenCalledWith( SITE_ID );
		expect( replaceProductsInCart ).toHaveBeenCalledTimes( 1 );
		expect( replaceProductsInCart.mock.calls[ 0 ][ 0 ] ).toEqual( [
			expect.objectContaining( {
				product_id: 1011,
				product_slug: 'wpcom-hosting-business',
				extra: { agency_id: AGENCY_ID, isA4ADevSiteCheckout: true },
			} ),
		] );
	} );
} );
