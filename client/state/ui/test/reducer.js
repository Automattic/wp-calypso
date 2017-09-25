/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { isNotificationsOpen, selectedSiteId, siteSelectionInitialized } from '../reducer';
import { SELECTED_SITE_SET, SERIALIZE, DESERIALIZE, NOTIFICATIONS_PANEL_TOGGLE } from 'state/action-types';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'actionLog',
			'dropZone',
			'editor',
			'guidedTour',
			'happychat',
			'hasSidebar',
			'isLoading',
			'isNotificationsOpen',
			'isPreviewShowing',
			'layoutFocus',
			'mediaModal',
			'npsSurveyNotice',
			'oauth2Clients',
			'olark',
			'postTypeList',
			'preview',
			'queryArguments',
			'reader',
			'section',
			'selectedSiteId',
			'siteSelectionInitialized',
			'themeSetup',
		] );
	} );

	it( 'should refuse to persist any state', () => {
		const state = reducer( {
			selectedSiteId: 2916284
		}, { type: SERIALIZE } );

		expect( state ).to.eql( {} );
	} );

	it( 'should refuse to restore any persisted state', () => {
		const state = reducer( {
			selectedSiteId: 2916284
		}, { type: DESERIALIZE } );

		expect( state ).to.eql( {} );
	} );

	describe( '#selectedSiteId()', () => {
		it( 'should default to null', () => {
			const state = selectedSiteId( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set the selected site ID', () => {
			const state = selectedSiteId( null, {
				type: SELECTED_SITE_SET,
				siteId: 2916284
			} );

			expect( state ).to.equal( 2916284 );
		} );

		it( 'should set to null if siteId is undefined', () => {
			const state = selectedSiteId( null, {
				type: SELECTED_SITE_SET,
				siteId: undefined
			} );

			expect( state ).to.be.null;
		} );
	} );

	describe( '#isNotificationsOpen()', () => {
		it( 'should default to false', () => {
			const state = isNotificationsOpen( undefined, {} );
			expect( state ).to.equal( false );
		} );

		it( 'should toggle open when closed', () => {
			const state = isNotificationsOpen( false, {
				type: NOTIFICATIONS_PANEL_TOGGLE,
			} );
			expect( state ).to.equal( true );
		} );

		it( 'should toggle closed when open', () => {
			const state = isNotificationsOpen( true, {
				type: NOTIFICATIONS_PANEL_TOGGLE,
			} );
			expect( state ).to.equal( false );
		} );
	} );

	describe( '#siteSelectionInitialized()', () => {
		it( 'should default to false', () => {
			const state = siteSelectionInitialized( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should be true when a site is selected', () => {
			const state = siteSelectionInitialized( null, {
				type: SELECTED_SITE_SET,
				siteId: 2916284,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should be true if siteId is undefined', () => {
			const state = siteSelectionInitialized( null, {
				type: SELECTED_SITE_SET,
				siteId: undefined,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should be true if siteId is null', () => {
			const state = siteSelectionInitialized( null, {
				type: SELECTED_SITE_SET,
				siteId: null,
			} );

			expect( state ).to.be.true;
		} );
	} );
} );
