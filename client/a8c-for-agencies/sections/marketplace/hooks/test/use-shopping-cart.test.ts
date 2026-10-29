/**
 * @jest-environment jsdom
 */

import { act, waitFor } from '@testing-library/react';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { SELECTED_ITEMS_SESSION_STORAGE_KEY } from '../../lib/shopping-cart-storage';
import useShoppingCart from '../use-shopping-cart';

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn();
	return Object.assign( config, {
		isEnabled: ( flag: string ) => flag === 'a4a-bd-checkout',
	} );
} );

// One array across renders, as the query returns: the cart restores whenever it changes.
const mockProducts = [
	{
		slug: 'jetpack-backup-t1',
		family_slug: 'jetpack-backup',
		product_id: 2100,
		supported_bundles: [ { quantity: 5 }, { quantity: 10 } ],
	},
];

jest.mock( 'calypso/a8c-for-agencies/data/marketplace/use-products-query', () => ( {
	__esModule: true,
	default: () => ( { data: mockProducts } ),
} ) );

describe( 'useShoppingCart', () => {
	afterEach( () => sessionStorage.clear() );

	it( 'keeps a Billing Dragon line whose count is not a bundle size, and sets its count', async () => {
		sessionStorage.setItem( SELECTED_ITEMS_SESSION_STORAGE_KEY, 'jetpack-backup-t1:3' );
		const { result } = renderHookWithProvider( () => useShoppingCart() );

		await waitFor( () => expect( result.current.selectedCartItems ).toHaveLength( 1 ) );
		expect( result.current.selectedCartItems[ 0 ].quantity ).toBe( 3 );

		act( () => result.current.onSetCartItemQuantity( result.current.selectedCartItems[ 0 ], 7 ) );
		expect( sessionStorage.getItem( SELECTED_ITEMS_SESSION_STORAGE_KEY ) ).toBe(
			'jetpack-backup-t1:7'
		);
	} );
} );
