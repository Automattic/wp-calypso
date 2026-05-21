import deepFreeze from 'deep-freeze';
import { getAdminSidebarLayout } from '../selectors';
import type { LayoutDelta } from '../types';

const sampleDelta: LayoutDelta = {
	version: 1,
	updated_at: 1000,
	overrides: [
		{
			itemId: 'plugin:foo:-:foo.php',
			position: { kind: 'in_group', group_id: 'plugins', index: 0 },
		},
	],
};

describe( 'admin-sidebar layout selectors', () => {
	const state = deepFreeze( {
		adminSidebarLayout: {
			bySite: {
				'12345': sampleDelta,
			},
		},
	} );

	it( 'returns the stored delta when present', () => {
		expect( getAdminSidebarLayout( state, 12345 ) ).toBe( sampleDelta );
	} );

	it( 'returns null when nothing is stored for the site', () => {
		expect( getAdminSidebarLayout( state, 99999 ) ).toBeNull();
	} );

	it( 'returns null for falsy siteId', () => {
		expect( getAdminSidebarLayout( state, null ) ).toBeNull();
		expect( getAdminSidebarLayout( state, undefined ) ).toBeNull();
		expect( getAdminSidebarLayout( state, 0 ) ).toBeNull();
	} );

	it( 'normalises numeric and string siteIds', () => {
		expect( getAdminSidebarLayout( state, '12345' ) ).toBe( sampleDelta );
	} );
} );
