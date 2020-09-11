/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import menuFixture from './menu-fixture.skip';
import { ADMIN_MENU_RECEIVE } from 'state/action-types';
import adminReducer from '../reducer';

describe( 'reducer', () => {
	describe( 'adminReducer', () => {
		test( 'returns default state when no arguments provided', () => {
			const defaultState = deepFreeze( {} );
			expect( adminReducer( undefined, {} ) ).toEqual( defaultState );
		} );

		test( 'adds menu to state keyed by provided siteId', () => {
			const action = {
				type: ADMIN_MENU_RECEIVE,
				siteId: 123456,
				menu: menuFixture,
			};
			const initalState = deepFreeze( {} );

			expect( adminReducer( initalState, action ) ).toEqual( {
				123456: menuFixture,
			} );
		} );
	} );
} );
