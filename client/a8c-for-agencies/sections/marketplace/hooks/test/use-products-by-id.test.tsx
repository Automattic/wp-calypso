/**
 * @jest-environment jsdom
 */

import { waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import useProductsById from '../use-products-by-id';
import type { ReferralProduct } from '../../../client/types';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: jest.fn() } },
} ) );

const mockedGet = wpcom.req.get as jest.MockedFunction< typeof wpcom.req.get >;

const PRODUCT_FAMILIES = [
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
];

const referrals = ( ...ids: number[] ): ReferralProduct[] =>
	ids.map( ( product_id ) => ( { product_id } ) as ReferralProduct );

describe( 'useProductsById', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockedGet.mockResolvedValue( PRODUCT_FAMILIES );
	} );

	it.each( [
		[ 'yearly', 2714, '109' ],
		[ 'monthly', 3114, '9.08' ],
	] as const )( 'maps a %s product_id to its price as amount', async ( _, productId, price ) => {
		const { result } = renderHookWithProvider( () => useProductsById( referrals( productId ) ) );

		await waitFor( () => expect( result.current.referredProducts ).toHaveLength( 1 ) );

		const [ product ] = result.current.referredProducts;
		expect( product.product_id ).toBe( productId );
		expect( product.amount ).toBe( price );
		expect( product.price_per_unit_display ).toBe( price );
	} );

	it( 'returns no product when the referral does not match', async () => {
		const { result } = renderHookWithProvider( () => useProductsById( referrals( 99999 ) ) );

		await waitFor( () => expect( mockedGet ).toHaveBeenCalled() );

		expect( result.current.referredProducts ).toEqual( [] );
	} );
} );
