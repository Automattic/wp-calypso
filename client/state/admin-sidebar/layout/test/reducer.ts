import deepFreeze from 'deep-freeze';
import {
	ADMIN_SIDEBAR_LAYOUT_RECEIVE,
	ADMIN_SIDEBAR_LAYOUT_CLEAR,
} from 'calypso/state/action-types';
import { bySite } from '../reducer';
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

describe( 'adminSidebarLayout reducer — bySite', () => {
	it( 'returns the empty default state', () => {
		expect( bySite( undefined, { type: 'NOOP' } ) ).toEqual( {} );
	} );

	it( 'stores a delta under the site key on receive', () => {
		const next = bySite( deepFreeze( {} ), {
			type: ADMIN_SIDEBAR_LAYOUT_RECEIVE,
			siteId: 12345,
			delta: sampleDelta,
		} );
		expect( next ).toEqual( { '12345': sampleDelta } );
	} );

	it( 'replaces the existing delta on subsequent receives', () => {
		const initial = deepFreeze( { '12345': sampleDelta } );
		const replaced: LayoutDelta = {
			version: 1,
			updated_at: 2000,
			overrides: [],
		};
		const next = bySite( initial, {
			type: ADMIN_SIDEBAR_LAYOUT_RECEIVE,
			siteId: 12345,
			delta: replaced,
		} );
		expect( next[ '12345' ] ).toBe( replaced );
	} );

	it( 'normalises numeric and string siteIds to the same string key', () => {
		const a = bySite( deepFreeze( {} ), {
			type: ADMIN_SIDEBAR_LAYOUT_RECEIVE,
			siteId: 12345,
			delta: sampleDelta,
		} );
		const b = bySite( deepFreeze( {} ), {
			type: ADMIN_SIDEBAR_LAYOUT_RECEIVE,
			siteId: '12345',
			delta: sampleDelta,
		} );
		expect( a ).toEqual( b );
	} );

	it( 'clears a single site entry', () => {
		const initial = deepFreeze( {
			'12345': sampleDelta,
			'67890': { ...sampleDelta, updated_at: 2000 },
		} );
		const next = bySite( initial, {
			type: ADMIN_SIDEBAR_LAYOUT_CLEAR,
			siteId: 12345,
		} );
		expect( next ).toEqual( { '67890': { ...sampleDelta, updated_at: 2000 } } );
	} );

	it( 'no-ops when clearing a site without an entry', () => {
		const initial = deepFreeze( { '12345': sampleDelta } );
		const next = bySite( initial, {
			type: ADMIN_SIDEBAR_LAYOUT_CLEAR,
			siteId: 99999,
		} );
		expect( next ).toBe( initial );
	} );
} );
