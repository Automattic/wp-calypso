/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import menuFixture from './fixture/menu-fixture';
import { ADMIN_MENU_RECEIVE } from 'state/action-types';
import adminReducer from '../reducer';

describe( 'reducer', () => {
	describe( 'adminReducer', () => {
		test( 'returns default state when no arguments provided', () => {
			const defaultState = deepFreeze( {
				menus: {},
				requesting: {},
			} );
			expect( adminReducer( undefined, {} ) ).toEqual( defaultState );
		} );

		test( 'adds menu to state keyed by provided siteId', () => {
			const action = {
				type: ADMIN_MENU_RECEIVE,
				siteId: 123456,
				menu: menuFixture,
			};
			const initalState = deepFreeze( {
				menus: {},
				requesting: {},
			} );

			expect( adminReducer( initalState, action ) ).toEqual( {
				menus: {
					123456: menuFixture,
				},
				requesting: {
					isRequesting: false,
				},
			} );
		} );
	} );
} );
