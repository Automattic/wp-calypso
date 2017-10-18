/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { isNotificationsOpen, selectedSiteId, siteSelectionInitialized } from '../reducer';
import {
	SELECTED_SITE_SET,
	SERIALIZE,
	DESERIALIZE,
	NOTIFICATIONS_PANEL_TOGGLE,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'actionLog',
			'dropZone',
			'editor',
			'guidedTour',
			'hasSidebar',
			'isLoading',
			'isNotificationsOpen',
			'isPreviewShowing',
			'layoutFocus',
			'language',
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

	test( 'should refuse to persist any state', () => {
		const state = reducer(
			{
				selectedSiteId: 2916284,
			},
			{ type: SERIALIZE }
		);

		expect( state ).to.eql( {} );
	} );

	test( 'should refuse to restore any persisted state', () => {
		const state = reducer(
			{
				selectedSiteId: 2916284,
			},
			{ type: DESERIALIZE }
		);

		expect( state ).to.eql( {} );
	} );

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
} );
