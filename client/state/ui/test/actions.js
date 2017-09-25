/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { setSelectedSiteId, setRoute, toggleNotificationsPanel } from '../actions';
import { SELECTED_SITE_SET, ROUTE_SET, NOTIFICATIONS_PANEL_TOGGLE } from 'state/action-types';

describe( 'actions', () => {
	describe( '#setSelectedSiteId()', () => {
		it( 'should return an action object', () => {
			const action = setSelectedSiteId( 2916284 );

			expect( action ).to.eql( {
				type: SELECTED_SITE_SET,
				siteId: 2916284
			} );
		} );
	} );

	describe( 'setRoute()', () => {
		it( 'should return an action object', () => {
			const action = setRoute( '/foo' );

			expect( action ).to.eql( {
				type: ROUTE_SET,
				path: '/foo',
				query: {}
			} );
		} );
	} );

	describe( 'toggleNotificationsPanel()', () => {
		it( 'should return an action object', () => {
			expect( toggleNotificationsPanel() ).to.eql( {
				type: NOTIFICATIONS_PANEL_TOGGLE,
			} );
		} );
	} );
} );
