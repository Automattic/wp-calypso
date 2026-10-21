import deepFreeze from 'deep-freeze';
import { getAdminSidebarGroupExpanded, getAdminSidebarExpandedBySite } from '../selectors';

describe( 'admin-sidebar expand-state selectors', () => {
	const state = deepFreeze( {
		adminSidebarExpandState: {
			bySite: {
				'12345': {
					plugins: true,
					addons: false,
				},
			},
		},
	} );

	describe( 'getAdminSidebarGroupExpanded', () => {
		it( 'returns the stored boolean when present', () => {
			expect( getAdminSidebarGroupExpanded( state, 12345, 'plugins' ) ).toBe( true );
			expect( getAdminSidebarGroupExpanded( state, 12345, 'addons' ) ).toBe( false );
		} );

		it( 'returns undefined when no entry is stored', () => {
			expect( getAdminSidebarGroupExpanded( state, 12345, 'never-toggled' ) ).toBeUndefined();
			expect( getAdminSidebarGroupExpanded( state, 99999, 'plugins' ) ).toBeUndefined();
		} );

		it( 'returns undefined for falsy siteId / groupId', () => {
			expect( getAdminSidebarGroupExpanded( state, null, 'plugins' ) ).toBeUndefined();
			expect( getAdminSidebarGroupExpanded( state, 12345, null ) ).toBeUndefined();
		} );

		it( 'normalises numeric and string siteIds', () => {
			expect( getAdminSidebarGroupExpanded( state, '12345', 'plugins' ) ).toBe( true );
		} );
	} );

	describe( 'getAdminSidebarExpandedBySite', () => {
		it( 'returns the full per-site map', () => {
			expect( getAdminSidebarExpandedBySite( state, 12345 ) ).toEqual( {
				plugins: true,
				addons: false,
			} );
		} );

		it( 'returns an empty object when no site entry exists', () => {
			expect( getAdminSidebarExpandedBySite( state, 99999 ) ).toEqual( {} );
		} );
	} );
} );
