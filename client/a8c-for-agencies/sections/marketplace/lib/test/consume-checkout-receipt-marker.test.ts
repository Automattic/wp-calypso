/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import consumeCheckoutReceiptMarker from '../consume-checkout-receipt-marker';
import {
	SELECTED_ITEMS_SESSION_STORAGE_KEY,
	SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL,
} from '../shopping-cart-storage';
import type { Context } from '@automattic/calypso-router';

jest.mock( '@automattic/calypso-router', () => ( {
	replace: jest.fn(),
} ) );

function buildContext( canonicalPath: string, query: Record< string, string > ): Context {
	return { canonicalPath, query } as unknown as Context;
}

describe( 'consumeCheckoutReceiptMarker', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		sessionStorage.clear();
		sessionStorage.setItem( SELECTED_ITEMS_SESSION_STORAGE_KEY, 'jetpack-backup:1' );
		sessionStorage.setItem( SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL, 'jetpack-scan:1' );
	} );

	it( 'clears the regular cart and strips receipt_id from the URL without a reload', () => {
		consumeCheckoutReceiptMarker(
			buildContext( '/purchases/licenses?receipt_id=12345', { receipt_id: '12345' } )
		);

		expect( sessionStorage.getItem( SELECTED_ITEMS_SESSION_STORAGE_KEY ) ).toBeNull();
		expect( sessionStorage.getItem( SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL ) ).toBe(
			'jetpack-scan:1'
		);
		expect( page.replace ).toHaveBeenCalledWith( '/purchases/licenses', null, false, false );
	} );

	it( 'preserves other query args when stripping receipt_id', () => {
		consumeCheckoutReceiptMarker(
			buildContext( '/purchases/licenses?receipt_id=12345&page=2', {
				receipt_id: '12345',
				page: '2',
			} )
		);

		expect( page.replace ).toHaveBeenCalledWith( '/purchases/licenses?page=2', null, false, false );
	} );

	it( 'does nothing without a receipt_id, so reloading the clean URL keeps the cart', () => {
		consumeCheckoutReceiptMarker( buildContext( '/purchases/licenses', {} ) );

		expect( sessionStorage.getItem( SELECTED_ITEMS_SESSION_STORAGE_KEY ) ).toBe(
			'jetpack-backup:1'
		);
		expect( page.replace ).not.toHaveBeenCalled();
	} );
} );
