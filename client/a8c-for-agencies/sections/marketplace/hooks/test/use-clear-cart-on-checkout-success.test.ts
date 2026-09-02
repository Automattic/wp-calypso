/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	SELECTED_ITEMS_SESSION_STORAGE_KEY,
	SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL,
} from '../../lib/shopping-cart-storage';
import useClearCartOnCheckoutSuccess from '../use-clear-cart-on-checkout-success';

const mockDispatch = jest.fn();

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( ( name, properties ) => ( {
		type: 'RECORD_TRACKS_EVENT',
		name,
		properties,
	} ) ),
} ) );

describe( 'useClearCartOnCheckoutSuccess', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		sessionStorage.clear();
		sessionStorage.setItem( SELECTED_ITEMS_SESSION_STORAGE_KEY, 'jetpack-backup:1' );
		sessionStorage.setItem( SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL, 'jetpack-scan:1' );
	} );

	it( 'clears the regular cart, records the event and strips receipt_id from the URL', () => {
		window.history.replaceState( null, '', '/purchases/licenses?receipt_id=12345&page=2' );

		renderHook( () => useClearCartOnCheckoutSuccess() );

		expect( sessionStorage.getItem( SELECTED_ITEMS_SESSION_STORAGE_KEY ) ).toBeNull();
		expect( sessionStorage.getItem( SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL ) ).toBe(
			'jetpack-scan:1'
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_cart_cleared_on_checkout_success',
			{ receipt_id: '12345' }
		);
		expect( window.location.search ).toBe( '?page=2' );
	} );

	it( 'does nothing without a receipt_id, so reloading the stripped URL keeps the cart', () => {
		window.history.replaceState( null, '', '/purchases/licenses?page=2' );

		renderHook( () => useClearCartOnCheckoutSuccess() );

		expect( sessionStorage.getItem( SELECTED_ITEMS_SESSION_STORAGE_KEY ) ).toBe(
			'jetpack-backup:1'
		);
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
