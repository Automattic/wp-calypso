import deepFreeze from 'deep-freeze';
import { getAdminMenu, getAdminMenuGroups } from '../selectors';
import menuFixture from './fixture/menu-fixture';

const frozenFixture = deepFreeze( menuFixture );
const groupsFixture = deepFreeze( [
	{
		id: 'plugins',
		label: 'My Plugins',
		default_expanded: false,
		signal: { attention: true, count: 3 },
	},
] );

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

	describe( '#getAdminMenuGroups', () => {
		test( 'returns null when state is undefined', () => {
			const state = {};

			expect( getAdminMenuGroups( state, 123456 ) ).toEqual( null );
		} );

		test( 'returns null when siteId is not provided', () => {
			const state = {
				adminMenu: {
					groupsBySite: {
						56789: groupsFixture,
					},
				},
			};

			expect( getAdminMenuGroups( state ) ).toEqual( null );
		} );

		test( 'returns group metadata when siteId is present', () => {
			const state = {
				adminMenu: {
					groupsBySite: {
						56789: [],
						12345: groupsFixture,
					},
				},
			};

			expect( getAdminMenuGroups( state, 12345 ) ).toEqual( groupsFixture );
		} );
	} );
} );
