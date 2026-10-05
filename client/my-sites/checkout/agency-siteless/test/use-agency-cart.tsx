/**
 * @jest-environment jsdom
 */
import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { useShoppingCart } from '@automattic/shopping-cart';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import useAgencyCart from '../use-agency-cart';
import type { AgencyCartEntry } from '../../agency-checkout/lib/agency-checkout-params';
import type { Agency, AgencyProduct } from '@automattic/api-core';
import type { PropsWithChildren } from 'react';

jest.mock( '@automattic/shopping-cart', () => ( {
	...jest.requireActual( '@automattic/shopping-cart' ),
	useShoppingCart: jest.fn(),
} ) );

const AGENCY_ID = 42;
const products = [
	{
		slug: 'wpcom-hosting-business',
		product_id: 1008,
		monthly_product_id: 1009,
		yearly_product_id: 1008,
		monthly_alternative_product_id: 1011,
		yearly_alternative_product_id: 1010,
	},
	{ slug: 'jetpack-backup-t1', product_id: 2112, alternative_product_id: 2010 },
] as AgencyProduct[];

const replaceProductsInCart = jest.fn();

function renderCart(
	entries: AgencyCartEntry[],
	{ agency = { id: AGENCY_ID } as Agency }: { agency?: Agency | null } = {}
) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( activeAgencyQuery().queryKey, agency );
	queryClient.setQueryData( agencyProductsQuery( AGENCY_ID ).queryKey, products );

	return renderHook( () => useAgencyCart( entries, 'yearly' ), {
		wrapper: ( { children }: PropsWithChildren ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		),
	} );
}

function addedLines() {
	return replaceProductsInCart.mock.calls[ 0 ][ 0 ].map(
		( line: { product_id: number; product_slug: string; extra: object } ) => ( {
			product_id: line.product_id,
			product_slug: line.product_slug,
			extra: line.extra,
		} )
	);
}

describe( 'useAgencyCart', () => {
	beforeEach( () => {
		replaceProductsInCart.mockReset().mockResolvedValue( {} );
		( useShoppingCart as jest.Mock ).mockReturnValue( { replaceProductsInCart } );
	} );

	it( 'adds one line per unit, each with its own index, for the agency of the user', async () => {
		const { result } = renderCart( [
			{ slug: 'wpcom-hosting-business', quantity: 3 },
			{ slug: 'jetpack-backup-t1', quantity: 1 },
		] );

		await waitFor( () => expect( result.current.isReady ).toBe( true ) );

		expect( result.current.error ).toBeNull();
		expect( replaceProductsInCart ).toHaveBeenCalledTimes( 1 );
		const extra = { isA4ASitelessCheckout: true, agency_id: AGENCY_ID };
		expect( addedLines() ).toEqual( [
			{
				product_id: 1010,
				product_slug: 'wpcom-hosting-business',
				extra: { ...extra, cart_item_index: 0 },
			},
			{
				product_id: 1010,
				product_slug: 'wpcom-hosting-business',
				extra: { ...extra, cart_item_index: 1 },
			},
			{
				product_id: 1010,
				product_slug: 'wpcom-hosting-business',
				extra: { ...extra, cart_item_index: 2 },
			},
			{
				product_id: 2010,
				product_slug: 'jetpack-backup-t1',
				extra: { ...extra, cart_item_index: 0 },
			},
		] );
	} );

	it( 'leaves out a product the agency cannot buy', async () => {
		const { result } = renderCart( [
			{ slug: 'not-a-product', quantity: 2 },
			{ slug: 'jetpack-backup-t1', quantity: 1 },
		] );

		await waitFor( () => expect( result.current.isReady ).toBe( true ) );

		expect( addedLines().map( ( line: { product_slug: string } ) => line.product_slug ) ).toEqual( [
			'jetpack-backup-t1',
		] );
	} );

	it( 'reports an empty cart without calling the cart', async () => {
		const { result } = renderCart( [] );

		await waitFor( () => expect( result.current.error ).toBe( 'Your cart is empty.' ) );
		expect( result.current.isReady ).toBe( false );
		expect( replaceProductsInCart ).not.toHaveBeenCalled();
	} );

	it( 'reports a user without an agency without calling the cart', async () => {
		const { result } = renderCart( [ { slug: 'jetpack-backup-t1', quantity: 1 } ], {
			agency: null,
		} );

		await waitFor( () => expect( result.current.error ).toBe( 'We could not find your agency.' ) );
		expect( replaceProductsInCart ).not.toHaveBeenCalled();
	} );

	it( 'reports a cart that could not be filled', async () => {
		replaceProductsInCart.mockRejectedValue( new Error( 'nope' ) );
		const { result } = renderCart( [ { slug: 'jetpack-backup-t1', quantity: 1 } ] );

		await waitFor( () => expect( result.current.error ).toBe( 'Failed to add products to cart.' ) );
		expect( result.current.isReady ).toBe( false );
	} );
} );
