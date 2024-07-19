import {
	SELECTED_SITE_SET,
	NOTIFICATIONS_PANEL_TOGGLE,
	MOST_RECENTLY_SELECTED_SITE_SET,
} from 'calypso/state/action-types';
import {
	isNotificationsOpen,
	mostRecentlySelectedSiteId,
	selectedSiteId,
	siteSelectionInitialized,
} from '../reducer';

describe( 'reducer', () => {
	describe( '#selectedSiteId()', () => {
		test( 'should default to null', () => {
			const state = selectedSiteId( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should set the selected site ID', () => {
			const state = selectedSiteId( null, {
				type: SELECTED_SITE_SET,
				siteId: 2916284,
			} );

			expect( state ).toEqual( 2916284 );
		} );

		test( 'should set to null if siteId is undefined', () => {
			const state = selectedSiteId( null, {
				type: SELECTED_SITE_SET,
				siteId: undefined,
			} );

			expect( state ).toBeNull();
		} );
	} );

	describe( '#mostRecentlySelectedSiteId()', () => {
		test( 'should default to null', () => {
			const state = mostRecentlySelectedSiteId( undefined, {} );
			expect( state ).toBeNull();
		} );

		test( 'should set the actions site ID', () => {
			const state = mostRecentlySelectedSiteId( null, {
				type: MOST_RECENTLY_SELECTED_SITE_SET,
				siteId: 2916284,
			} );

			expect( state ).toEqual( 2916284 );
		} );

		test( 'should not set nullish values', () => {
			let state = mostRecentlySelectedSiteId( null, {
				type: MOST_RECENTLY_SELECTED_SITE_SET,
				siteId: 2916284,
			} );
			state = mostRecentlySelectedSiteId( state, {
				type: MOST_RECENTLY_SELECTED_SITE_SET,
				siteId: null,
			} );

			expect( state ).toEqual( 2916284 );
		} );
	} );

	describe( '#isNotificationsOpen()', () => {
		test( 'should default to false', () => {
			const state = isNotificationsOpen( undefined, {} );
			expect( state ).toEqual( false );
		} );

		test( 'should toggle open when closed', () => {
			const state = isNotificationsOpen( false, {
				type: NOTIFICATIONS_PANEL_TOGGLE,
			} );
			expect( state ).toEqual( true );
		} );

		test( 'should toggle closed when open', () => {
			const state = isNotificationsOpen( true, {
				type: NOTIFICATIONS_PANEL_TOGGLE,
			} );
			expect( state ).toEqual( false );
		} );
	} );

	describe( '#siteSelectionInitialized()', () => {
		test( 'should default to false', () => {
			const state = siteSelectionInitialized( undefined, {} );

			expect( state ).toBe( false );
		} );

		test( 'should be true when a site is selected', () => {
			const state = siteSelectionInitialized( null, {
				type: SELECTED_SITE_SET,
				siteId: 2916284,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should be true if siteId is undefined', () => {
			const state = siteSelectionInitialized( null, {
				type: SELECTED_SITE_SET,
				siteId: undefined,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should be true if siteId is null', () => {
			const state = siteSelectionInitialized( null, {
				type: SELECTED_SITE_SET,
				siteId: null,
			} );

			expect( state ).toBe( true );
		} );
	} );
} );
