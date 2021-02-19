/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	collapseSidebar,
	expandSidebar,
	navigate,
	setAllSitesSelected,
	setPreviewShowing,
	setSection,
	setSelectedSiteId,
	toggleNotificationsPanel,
} from '../actions';
import {
	NAVIGATE,
	NOTIFICATIONS_PANEL_TOGGLE,
	PREVIEW_IS_SHOWING,
	SIDEBAR_TOGGLE_VISIBILITY,
	SECTION_SET,
	SELECTED_SITE_SET,
} from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( 'setAllSitesSelected()', () => {
		test( 'should return an action object with a null siteId', () => {
			const action = setAllSitesSelected();

			expect( action ).to.eql( {
				type: SELECTED_SITE_SET,
				siteId: null,
			} );
		} );
	} );

	describe( 'setPreviewShowing()', () => {
		test( 'should return an action object where isShowing is true', () => {
			const action = setPreviewShowing( true );

			expect( action ).to.eql( {
				type: PREVIEW_IS_SHOWING,
				isShowing: true,
			} );
		} );

		test( 'should return an action object where isShowing is false', () => {
			const action = setPreviewShowing( false );

			expect( action ).to.eql( {
				type: PREVIEW_IS_SHOWING,
				isShowing: false,
			} );
		} );
	} );

	describe( 'setSection()', () => {
		test( 'should return an action object with the section specified', () => {
			const section = { name: 'me' };

			expect( setSection( section ) ).to.eql( {
				type: SECTION_SET,
				section,
			} );
		} );
	} );

	describe( 'setSelectedSiteId()', () => {
		test( 'should return an action object with the siteId set', () => {
			const siteId = 2916284;
			const action = setSelectedSiteId( siteId );

			expect( action ).to.eql( {
				type: SELECTED_SITE_SET,
				siteId,
			} );
		} );
	} );

	describe( 'toggleNotificationsPanel()', () => {
		test( 'should return an action object with just the action type', () => {
			expect( toggleNotificationsPanel() ).to.eql( {
				type: NOTIFICATIONS_PANEL_TOGGLE,
			} );
		} );
	} );

	describe( 'navigate()', () => {
		test( 'should return an action object with the path specified', () => {
			const path = '/test/path';
			const action = navigate( path );

			expect( action ).to.eql( {
				type: NAVIGATE,
				path,
			} );
		} );
	} );

	describe( 'expandSidebar', () => {
		test( 'should return an action object with the action type and sidebarIsCollapsed= false', () => {
			expect( expandSidebar() ).to.eql( {
				type: SIDEBAR_TOGGLE_VISIBILITY,
				collapsed: false,
			} );
		} );
	} );

	describe( 'collapseSidebar', () => {
		test( 'should return an action object with the action type and sidebarIsCollapsed= true', () => {
			expect( collapseSidebar() ).to.eql( {
				type: SIDEBAR_TOGGLE_VISIBILITY,
				collapsed: true,
			} );
		} );
	} );
} );
