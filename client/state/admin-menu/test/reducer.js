/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import menuFixture from './fixture/menu-fixture';
import { ADMIN_MENU_RECEIVE, ADMIN_MENU_REQUEST } from 'state/action-types';
import { menus as menusReducer, requesting as requestingReducer } from '../reducer';

describe( 'reducer', () => {
	describe( 'menus reducer', () => {
		test( 'returns default state when no arguments provided', () => {
			const defaultState = deepFreeze( {} );
			expect( menusReducer( undefined, {} ) ).toEqual( defaultState );
		} );

		test( 'adds menu to state keyed by provided siteId', () => {
			const action = {
				type: ADMIN_MENU_RECEIVE,
				siteId: 123456,
				menu: menuFixture,
			};
			const initialState = deepFreeze( {} );

			expect( menusReducer( initialState, action ) ).toEqual( {
				123456: menuFixture,
			} );
		} );
	} );

	describe( 'requesting reducer', () => {
		test( 'returns default state when no action provided', () => {
			expect( requestingReducer( undefined, {} ) ).toBe( false );
		} );

		test( 'returns true for ADMIN_MENU_REQUEST action', () => {
			const initialState = deepFreeze( false );
			expect(
				requestingReducer( initialState, {
					type: ADMIN_MENU_REQUEST,
				} )
			).toBe( true );
		} );

		test( 'resets to false for ADMIN_MENU_RECEIVE action', () => {
			const initialState = deepFreeze( true );
			expect(
				requestingReducer( initialState, {
					type: ADMIN_MENU_RECEIVE,
				} )
			).toBe( false );
		} );

		test.each( [ false, true ] )( 'ignores invalid action types', ( theInitialStateBool ) => {
			const initialState = deepFreeze( theInitialStateBool );
			expect(
				requestingReducer( initialState, {
					type: 'A_FAKE_ACTION_SHOULD_BE_IGNORED',
				} )
			).toBe( theInitialStateBool );
		} );
	} );
} );
