/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	isNotificationsOpen,
	selectedSiteId,
	sidebarIsCollapsed,
	siteSelectionInitialized,
} from '../reducer';
import {
	SELECTED_SITE_SET,
	NOTIFICATIONS_PANEL_TOGGLE,
	SIDEBAR_TOGGLE_VISIBILITY,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( '#selectedSiteId()', () => {
		test( 'should default to null', () => {
			const state = selectedSiteId( undefined, {} );

			expect( state ).to.be.null;
		} );

		test( 'should set the selected site ID', () => {
			const state = selectedSiteId( null, {
				type: SELECTED_SITE_SET,
				siteId: 2916284,
			} );

			expect( state ).to.equal( 2916284 );
		} );

		test( 'should set to null if siteId is undefined', () => {
			const state = selectedSiteId( null, {
				type: SELECTED_SITE_SET,
				siteId: undefined,
			} );

			expect( state ).to.be.null;
		} );
	} );

	describe( '#isNotificationsOpen()', () => {
		test( 'should default to false', () => {
			const state = isNotificationsOpen( undefined, {} );
			expect( state ).to.equal( false );
		} );

		test( 'should toggle open when closed', () => {
			const state = isNotificationsOpen( false, {
				type: NOTIFICATIONS_PANEL_TOGGLE,
			} );
			expect( state ).to.equal( true );
		} );

		test( 'should toggle closed when open', () => {
			const state = isNotificationsOpen( true, {
				type: NOTIFICATIONS_PANEL_TOGGLE,
			} );
			expect( state ).to.equal( false );
		} );
	} );

	describe( '#siteSelectionInitialized()', () => {
		test( 'should default to false', () => {
			const state = siteSelectionInitialized( undefined, {} );

			expect( state ).to.be.false;
		} );

		test( 'should be true when a site is selected', () => {
			const state = siteSelectionInitialized( null, {
				type: SELECTED_SITE_SET,
				siteId: 2916284,
			} );

			expect( state ).to.be.true;
		} );

		test( 'should be true if siteId is undefined', () => {
			const state = siteSelectionInitialized( null, {
				type: SELECTED_SITE_SET,
				siteId: undefined,
			} );

			expect( state ).to.be.true;
		} );

		test( 'should be true if siteId is null', () => {
			const state = siteSelectionInitialized( null, {
				type: SELECTED_SITE_SET,
				siteId: null,
			} );

			expect( state ).to.be.true;
		} );
	} );

	describe( '#getSidebarIsCollapsed()', () => {
		test( 'should default to false', () => {
			const defaultState = deepFreeze( false );
			expect( sidebarIsCollapsed( undefined, {} ) ).equal( defaultState );
		} );

		test( 'should be true when collapsed', () => {
			const defaultState = deepFreeze( true );
			const state = sidebarIsCollapsed( false, {
				type: SIDEBAR_TOGGLE_VISIBILITY,
				collapsed: true,
			} );

			expect( state ).equal( defaultState );
		} );

		test( 'should be false when expanded', () => {
			const defaultState = deepFreeze( false );
			const state = sidebarIsCollapsed( true, {
				type: SIDEBAR_TOGGLE_VISIBILITY,
				collapsed: false,
			} );

			expect( state ).equal( defaultState );
		} );
	} );
} );
