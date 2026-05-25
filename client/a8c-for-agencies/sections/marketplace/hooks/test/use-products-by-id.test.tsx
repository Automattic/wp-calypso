/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import useProductsById from '../use-products-by-id';
import type { ReferralProduct } from '../../../client/types';
import type { ReactNode } from 'react';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			get: jest.fn(),
		},
	},
} ) );

const mockedGet = wpcom.req.get as jest.MockedFunction< typeof wpcom.req.get >;

function wrapper( { children }: { children: ReactNode } ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

function mockProductFamilies() {
	mockedGet.mockResolvedValueOnce( [
		{
			name: 'WooCommerce Extensions',
			slug: 'woo-extensions',
			products: [
				{
					name: 'Conditional Shipping and Payments',
					slug: 'woocommerce-conditional-shipping-payments',
					product_id: 2714,
					yearly_product_id: 2714,
					monthly_product_id: 3114,
					monthly_alternative_product_id: null,
					yearly_alternative_product_id: null,
					currency: 'USD',
					monthly_price: 9.08,
					yearly_price: 109,
					metadata: null,
				},
			],
		},
	] );
}

const referralProduct = ( product_id: number ): ReferralProduct =>
	( { product_id } ) as ReferralProduct;

describe( 'useProductsById', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'maps a yearly product_id to the yearly price as amount', async () => {
		mockProductFamilies();

		const { result } = renderHook( () => useProductsById( [ referralProduct( 2714 ) ] ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.referredProducts ).toHaveLength( 1 ) );

		const [ product ] = result.current.referredProducts;
		expect( product.product_id ).toBe( 2714 );
		expect( product.amount ).toBe( '109' );
		expect( product.price_per_unit_display ).toBe( '109' );
	} );

	it( 'maps a monthly product_id to the monthly price as amount', async () => {
		mockProductFamilies();

		const { result } = renderHook( () => useProductsById( [ referralProduct( 3114 ) ] ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.referredProducts ).toHaveLength( 1 ) );

		const [ product ] = result.current.referredProducts;
		expect( product.product_id ).toBe( 3114 );
		expect( product.amount ).toBe( '9.08' );
		expect( product.price_per_unit_display ).toBe( '9.08' );
	} );

	it( 'returns no product when the referral product_id does not match any product', async () => {
		mockProductFamilies();

		const { result } = renderHook( () => useProductsById( [ referralProduct( 99999 ) ] ), {
			wrapper,
		} );

		// Wait for the fetch to settle so we know the hook ran its effect.
		await waitFor( () => expect( mockedGet ).toHaveBeenCalled() );

		expect( result.current.referredProducts ).toEqual( [] );
	} );
} );
