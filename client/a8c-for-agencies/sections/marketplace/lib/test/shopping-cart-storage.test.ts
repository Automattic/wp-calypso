/**
 * @jest-environment jsdom
 */
import {
	SELECTED_ITEMS_SESSION_STORAGE_KEY,
	SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL,
	getSelectedItemsStorageKey,
	clearPersistedSelectedItems,
} from '../shopping-cart-storage';

describe( 'getSelectedItemsStorageKey', () => {
	it( 'returns the regular key for the regular marketplace', () => {
		expect( getSelectedItemsStorageKey( 'regular' ) ).toBe( SELECTED_ITEMS_SESSION_STORAGE_KEY );
	} );

	it( 'returns the referral key for the referral marketplace', () => {
		expect( getSelectedItemsStorageKey( 'referral' ) ).toBe(
			SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL
		);
	} );
} );

describe( 'clearPersistedSelectedItems', () => {
	beforeEach( () => {
		sessionStorage.clear();
		sessionStorage.setItem( SELECTED_ITEMS_SESSION_STORAGE_KEY, 'jetpack-backup:1' );
		sessionStorage.setItem( SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL, 'jetpack-scan:1' );
	} );

	it( 'clears the regular cart by default and keeps the referral cart', () => {
		clearPersistedSelectedItems();

		expect( sessionStorage.getItem( SELECTED_ITEMS_SESSION_STORAGE_KEY ) ).toBeNull();
		expect( sessionStorage.getItem( SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL ) ).toBe(
			'jetpack-scan:1'
		);
	} );

	it( 'clears the referral cart and keeps the regular cart', () => {
		clearPersistedSelectedItems( 'referral' );

		expect( sessionStorage.getItem( SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL ) ).toBeNull();
		expect( sessionStorage.getItem( SELECTED_ITEMS_SESSION_STORAGE_KEY ) ).toBe(
			'jetpack-backup:1'
		);
	} );
} );
