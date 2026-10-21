import deepFreeze from 'deep-freeze';
import {
	ADMIN_SIDEBAR_GROUP_TOGGLE,
	ADMIN_SIDEBAR_GROUP_SET_EXPANDED,
} from 'calypso/state/action-types';
import { bySite } from '../reducer';

describe( 'adminSidebarExpandState reducer — bySite', () => {
	it( 'returns the empty default state', () => {
		expect( bySite( undefined, { type: 'NOOP' } ) ).toEqual( {} );
	} );

	it( 'flips an unset entry to expanded on first toggle', () => {
		const state = bySite( deepFreeze( {} ), {
			type: ADMIN_SIDEBAR_GROUP_TOGGLE,
			siteId: 12345,
			groupId: 'plugins',
		} );
		expect( state ).toEqual( { '12345': { plugins: true } } );
	} );

	it( 'flips an existing entry on toggle', () => {
		const initial = deepFreeze( { '12345': { plugins: true } } );
		const state = bySite( initial, {
			type: ADMIN_SIDEBAR_GROUP_TOGGLE,
			siteId: 12345,
			groupId: 'plugins',
		} );
		expect( state ).toEqual( { '12345': { plugins: false } } );
	} );

	it( 'sets an explicit value via setExpanded', () => {
		const state = bySite( deepFreeze( {} ), {
			type: ADMIN_SIDEBAR_GROUP_SET_EXPANDED,
			siteId: 12345,
			groupId: 'plugins',
			expanded: true,
		} );
		expect( state ).toEqual( { '12345': { plugins: true } } );
	} );

	it( 'no-ops when setExpanded matches the current value', () => {
		const initial = deepFreeze( { '12345': { plugins: true } } );
		const next = bySite( initial, {
			type: ADMIN_SIDEBAR_GROUP_SET_EXPANDED,
			siteId: 12345,
			groupId: 'plugins',
			expanded: true,
		} );
		expect( next ).toBe( initial );
	} );

	it( 'keeps state for other sites untouched on a toggle', () => {
		const initial = deepFreeze( {
			'12345': { plugins: true },
			'67890': { addons: true },
		} );
		const state = bySite( initial, {
			type: ADMIN_SIDEBAR_GROUP_TOGGLE,
			siteId: 12345,
			groupId: 'plugins',
		} );
		expect( state ).toEqual( {
			'12345': { plugins: false },
			'67890': { addons: true },
		} );
	} );

	it( 'normalises numeric and string siteIds to the same string key', () => {
		const a = bySite( deepFreeze( {} ), {
			type: ADMIN_SIDEBAR_GROUP_TOGGLE,
			siteId: 12345,
			groupId: 'plugins',
		} );
		const b = bySite( deepFreeze( {} ), {
			type: ADMIN_SIDEBAR_GROUP_TOGGLE,
			siteId: '12345',
			groupId: 'plugins',
		} );
		expect( a ).toEqual( b );
	} );
} );
