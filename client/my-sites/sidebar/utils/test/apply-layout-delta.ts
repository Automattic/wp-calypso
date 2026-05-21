import { applyLayoutDelta } from '../apply-layout-delta';
import type { AdminMenuItem } from 'calypso/state/admin-menu/types';
import type { LayoutDelta } from 'calypso/state/admin-sidebar/layout/types';

// Legacy admin-menu responses do not carry `itemId`, so the field stays
// optional on `AdminMenuItem`. These test helpers force it present for
// layout-delta assertions.
type ItemWithId = AdminMenuItem & { itemId: string };

function makeItem( id: string, group: string | null = null ): ItemWithId {
	return {
		slug: id,
		title: id,
		type: 'menu-item',
		url: `/${ id }`,
		group_id: group,
		signal: null,
		itemId: id,
	};
}

describe( 'applyLayoutDelta', () => {
	it( 'returns a copy of the input when the delta is null', () => {
		const menu = [ makeItem( 'a' ), makeItem( 'b' ) ];
		const out = applyLayoutDelta( menu, null );
		expect( out ).toEqual( menu );
		expect( out ).not.toBe( menu );
	} );

	it( 'returns a copy when overrides is empty', () => {
		const menu = [ makeItem( 'a' ), makeItem( 'b' ) ];
		const delta: LayoutDelta = { version: 1, updated_at: 0, overrides: [] };
		expect( applyLayoutDelta( menu, delta ) ).toEqual( menu );
	} );

	it( 'returns an empty array for non-array input', () => {
		expect( applyLayoutDelta( null, null ) ).toEqual( [] );
		expect( applyLayoutDelta( undefined, null ) ).toEqual( [] );
	} );

	it( 'rebinds an item to a target group_id', () => {
		const menu = [ makeItem( 'a' ), makeItem( 'b', 'plugins' ), makeItem( 'c' ) ];
		const delta: LayoutDelta = {
			version: 1,
			updated_at: 0,
			overrides: [
				{
					itemId: 'a',
					position: { kind: 'in_group', group_id: 'plugins', index: 0 },
				},
			],
		};
		const out = applyLayoutDelta( menu, delta );
		const a = out.find( ( i ) => ( i as ItemWithId ).itemId === 'a' );
		expect( a?.group_id ).toBe( 'plugins' );
	} );

	it( 'moves an item from a group to top-level', () => {
		const menu = [ makeItem( 'a' ), makeItem( 'b', 'plugins' ), makeItem( 'c' ) ];
		const delta: LayoutDelta = {
			version: 1,
			updated_at: 0,
			overrides: [
				{
					itemId: 'b',
					position: { kind: 'top_level', index: 0 },
				},
			],
		};
		const out = applyLayoutDelta( menu, delta );
		const b = out.find( ( i ) => ( i as ItemWithId ).itemId === 'b' );
		expect( b?.group_id ).toBeNull();
	} );

	it( 'silently skips overrides whose itemId is not in the menu (stale-item preservation)', () => {
		const menu = [ makeItem( 'a' ), makeItem( 'b' ) ];
		const delta: LayoutDelta = {
			version: 1,
			updated_at: 0,
			overrides: [
				{
					itemId: 'deactivated-plugin',
					position: { kind: 'in_group', group_id: 'plugins', index: 0 },
				},
			],
		};
		const out = applyLayoutDelta( menu, delta );
		expect( out ).toEqual( menu );
	} );

	it( 'clamps an out-of-range index to the bucket end rather than no-op', () => {
		const menu = [ makeItem( 'p1', 'plugins' ), makeItem( 'p2', 'plugins' ), makeItem( 'orphan' ) ];
		const delta: LayoutDelta = {
			version: 1,
			updated_at: 0,
			overrides: [
				{
					itemId: 'orphan',
					position: { kind: 'in_group', group_id: 'plugins', index: 999 },
				},
			],
		};
		const out = applyLayoutDelta( menu, delta );
		const pluginItems = out.filter( ( i ) => i.group_id === 'plugins' );
		expect( pluginItems.map( ( i ) => ( i as ItemWithId ).itemId ) ).toEqual( [
			'p1',
			'p2',
			'orphan',
		] );
	} );

	it( 'applies overrides in array order — later overrides see earlier moves', () => {
		const menu = [
			makeItem( 'p1', 'plugins' ),
			makeItem( 'p2', 'plugins' ),
			makeItem( 'p3', 'plugins' ),
		];
		const delta: LayoutDelta = {
			version: 1,
			updated_at: 0,
			overrides: [
				{
					itemId: 'p3',
					position: { kind: 'in_group', group_id: 'plugins', index: 0 },
				},
				{
					itemId: 'p1',
					position: { kind: 'in_group', group_id: 'plugins', index: 1 },
				},
			],
		};
		const out = applyLayoutDelta( menu, delta );
		const pluginItems = out.filter( ( i ) => i.group_id === 'plugins' );
		expect( pluginItems.map( ( i ) => ( i as ItemWithId ).itemId ) ).toEqual( [
			'p3',
			'p1',
			'p2',
		] );
	} );

	it( 'does not mutate the input array', () => {
		const menu = [ makeItem( 'a' ), makeItem( 'b', 'plugins' ) ];
		const before = JSON.parse( JSON.stringify( menu ) );
		const delta: LayoutDelta = {
			version: 1,
			updated_at: 0,
			overrides: [
				{
					itemId: 'a',
					position: { kind: 'in_group', group_id: 'plugins', index: 0 },
				},
			],
		};
		applyLayoutDelta( menu, delta );
		expect( menu ).toEqual( before );
	} );
} );
