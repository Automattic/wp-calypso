/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import menuFixture from './fixture/menu-fixture';
import {
	ADMIN_MENU_RECEIVE,
	ADMIN_MENU_REQUEST,
	DESERIALIZE,
	SERIALIZE,
} from 'calypso/state/action-types';
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

		test( 'updates menu when there already is a menu', () => {
			const originalMenu = [
				{
					icon: 'dashicons-feedback',
					slug: 'the-original-menu-item',
					title: 'The Original Menu Item',
					type: 'menu-item',
					url: 'https://examplewebsite.wordpress.com/wp-admin/admin.php?page=original',
				},
			];

			const newMenu = menuFixture;

			// Populate initial state with a different menu from
			// the one we will be replacing it with.
			const initialState = deepFreeze( {
				123456: originalMenu,
			} );

			const action = {
				type: ADMIN_MENU_RECEIVE,
				siteId: 123456,
				menu: newMenu,
			};

			// Check the menu updates to reflect the new menu.
			expect( menusReducer( initialState, action ) ).toEqual( {
				123456: newMenu,
			} );
		} );

		describe( 'persistence', () => {
			test( 'correctly serializes state for persistence', () => {
				const initialState = deepFreeze( {
					123456: menuFixture,
				} );

				const action = { type: SERIALIZE };

				const serializationResult = menusReducer( initialState, action ).root();

				expect( serializationResult ).toEqual( {
					123456: menuFixture,
				} );
			} );

			test( 'correctly loads valid persisted state', () => {
				const stateToDeserialize = deepFreeze( {
					123456: menuFixture,
				} );

				const action = { type: DESERIALIZE };

				expect( menusReducer( stateToDeserialize, action ) ).toEqual( {
					123456: menuFixture,
				} );
			} );

			test.each( [
				{
					12345: [
						{
							title: 'Menu Item',
						},
					],
				},
				{
					12345: [
						{
							title: 'Menu Item',
							type: 'menu-item',
							children: [
								{
									title: 'Child Menu',
									type: 'sub-menu-item',
								},
							],
						},
					],
				},
				[
					{
						title: 'Hello world',
					},
				],
			] )(
				'loads default state when persisted state fails schema validation',
				( persistedState ) => {
					// Disable console here as `isValidStateWithSchema` util emits logs.
					// see: https://github.com/Automattic/wp-calypso/blob/02c3a452881ff89fce240c09d16874c0c4e4d429/client/state/utils/schema-utils.js#L14
					jest.spyOn( console, 'warn' ).mockImplementation( () => {} );

					// This is the state that will be returned for the `DESERIALIZE` action
					// if the persisted state fails schema validation
					const defaultReducerState = deepFreeze( {} );

					// This is the state to be validated against the schema.
					const stateToDeserialize = deepFreeze( persistedState );

					const state = menusReducer( stateToDeserialize, { type: DESERIALIZE } );
					expect( state ).toEqual( defaultReducerState );
				}
			);
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
