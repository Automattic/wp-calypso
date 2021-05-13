/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import menuFixture from './fixture/menu-fixture';
import { getAdminMenu } from '../selectors';

const frozenFixture = deepFreeze( menuFixture );

describe( 'selectors', () => {
	describe( '#getAdminMenu', () => {
		test( 'returns null when state is undefined', () => {
			const state = {};

			expect( getAdminMenu( state, 123456 ) ).toEqual( null );
		} );

		test( 'returns null when siteId is not provided', () => {
			const state = {
				adminMenu: {
					menus: {
						56789: frozenFixture,
					},
				},
			};

			expect( getAdminMenu( state ) ).toEqual( null );
		} );

		test( 'returns null data when requested siteId key is not present', () => {
			const state = {
				adminMenu: {
					menus: {
						56789: frozenFixture,
					},
				},
			};

			expect( getAdminMenu( state, 12345 ) ).toEqual( null );
		} );

		test( 'returns menu data when siteId is present', () => {
			const state = {
				adminMenu: {
					menus: {
						56789: {},
						12345: frozenFixture,
						84649: {},
						95538: {},
					},
				},
			};

			expect( getAdminMenu( state, 12345 ) ).toEqual( frozenFixture );
		} );
	} );
} );
