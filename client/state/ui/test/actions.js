/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	navigate,
	setAllSitesSelected,
	setPreviewShowing,
	setRoute,
	setSection,
	setApplication,
	setSelectedSiteId,
	toggleNotificationsPanel,
} from '../actions';
import {
	APPLICATION_SET,
	NAVIGATE,
	NOTIFICATIONS_PANEL_TOGGLE,
	PREVIEW_IS_SHOWING,
	ROUTE_SET,
	SECTION_SET,
	SELECTED_SITE_SET,
} from 'state/action-types';

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

	describe( 'setRoute()', () => {
		const route = '/foo';

		test( 'should return an action with an empty query object if no query is supplied', () => {
			const action = setRoute( route );

			expect( action ).to.eql( {
				type: ROUTE_SET,
				path: route,
				query: {},
			} );
		} );

		test( 'should return an action object with path and the specified query arguments', () => {
			const query = {
				foo: 'bar',
				bat: 123,
			};
			const action = setRoute( route, query );

			expect( action ).to.eql( {
				type: ROUTE_SET,
				path: route,
				query,
			} );
		} );
	} );

	describe( 'setSection()', () => {
		test( 'should return an action object where hasSidebar is true by default', () => {
			expect( setSection() ).to.eql( {
				type: SECTION_SET,
				hasSidebar: true,
			} );
		} );

		test( 'should return an action object with the section specified', () => {
			const section = { name: 'me' };

			expect( setSection( section ) ).to.eql( {
				type: SECTION_SET,
				section,
				hasSidebar: true,
			} );
		} );

		test( 'should return an action object with the section and hasSidebar specified', () => {
			const section = { name: 'me' };
			const options = { hasSidebar: false };

			expect( setSection( section, options ) ).to.eql( {
				type: SECTION_SET,
				section,
				hasSidebar: false,
			} );
		} );
	} );

	// setApplication
	describe( 'setApplication()', () => {
		test( 'should return an action object with the section specified', () => {
			const application = 'fun';

			expect( setApplication( 'fun' ) ).to.eql( {
				type: APPLICATION_SET,
				application: application,
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
} );
