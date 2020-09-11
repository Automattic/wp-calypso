/**
 * Internal dependencies
 */
import { requestAdminMenu, receiveAdminMenu } from '../actions';
import { ADMIN_MENU_REQUEST, ADMIN_MENU_RECEIVE } from 'state/action-types';
import menuFixture from './menu-fixture.skip';

describe( 'actions', () => {
	describe( 'requestAdminMenu', () => {
		test( 'creates action with correct action type and args', () => {
			const action = requestAdminMenu( 466422 );
			expect( action ).toEqual( {
				type: ADMIN_MENU_REQUEST,
				siteId: 466422,
			} );
		} );
	} );

	describe( 'receiveAdminMenu', () => {
		test( 'creates action with correct action type and args', () => {
			const action = receiveAdminMenu( 374948, menuFixture );
			expect( action ).toEqual( {
				type: ADMIN_MENU_RECEIVE,
				siteId: 374948,
				menu: menuFixture,
			} );
		} );
	} );
} );
