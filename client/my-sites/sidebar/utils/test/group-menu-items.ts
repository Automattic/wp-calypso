/**
 * @jest-environment jsdom
 */
import groupMenuItems from '../group-menu-items';
import {
	fixtureMenu,
	fixtureGroups,
	fixtureMenuWithEmptyGroup,
	fixtureMenuOrphanGroup,
	fixtureGroupsNoAttention,
} from './fixtures/grouped-menu-fixture';

describe( 'groupMenuItems()', () => {
	it( 'returns empty partitions when given no menu', () => {
		expect( groupMenuItems( null, fixtureGroups ) ).toEqual( {
			ungroupedItems: [],
			groupedSections: [],
		} );
		expect( groupMenuItems( undefined, [] ) ).toEqual( {
			ungroupedItems: [],
			groupedSections: [],
		} );
		expect( groupMenuItems( [], fixtureGroups ) ).toEqual( {
			ungroupedItems: [],
			groupedSections: [],
		} );
	} );

	it( 'keeps every item ungrouped when no group metadata is supplied', () => {
		const result = groupMenuItems( fixtureMenu, [] );
		expect( result.ungroupedItems ).toHaveLength( fixtureMenu.length );
		expect( result.groupedSections ).toEqual( [] );
		// Order is preserved verbatim.
		expect( result.ungroupedItems.map( ( item ) => item.slug ) ).toEqual( [
			'dashboard',
			'posts',
			'users',
			'yoast-seo',
			'woocommerce',
			'sensei-lms',
			'jetpack',
		] );
	} );

	it( 'partitions items by group_id and keeps ungrouped items flat', () => {
		const { ungroupedItems, groupedSections } = groupMenuItems( fixtureMenu, fixtureGroups );

		// Top-level: dashboard, posts, users — order preserved from the input.
		expect( ungroupedItems.map( ( item ) => item.slug ) ).toEqual( [
			'dashboard',
			'posts',
			'users',
		] );

		// One group: plugins, with yoast-seo + woocommerce in input order.
		expect( groupedSections ).toHaveLength( 1 );
		const pluginsSection = groupedSections[ 0 ];
		expect( pluginsSection.group.id ).toBe( 'plugins' );
		expect( pluginsSection.group.label ).toBe( 'My Plugins' );
		// `default_expanded: false` matches the contract.
		expect( pluginsSection.group.default_expanded ).toBe( false );
		expect( pluginsSection.items.map( ( item ) => item.slug ) ).toEqual( [
			'yoast-seo',
			'woocommerce',
			'sensei-lms',
			'jetpack',
		] );
	} );

	it( 'surfaces the group-level aggregate signal verbatim from input', () => {
		const result = groupMenuItems( fixtureMenu, fixtureGroups );
		expect( result.groupedSections[ 0 ].group.signal ).toEqual( {
			attention: true,
			count: 3,
		} );
	} );

	it( 'preserves item-level signals on grouped items', () => {
		const result = groupMenuItems( fixtureMenu, fixtureGroups );
		const yoast = result.groupedSections[ 0 ].items.find( ( item ) => item.slug === 'yoast-seo' );
		expect( yoast?.signal ).toEqual( {
			count: 3,
			numeric_badge: null,
			badge: null,
			inline_text: null,
			inline_icon: null,
			attention: true,
		} );
	} );

	it( 'drops groups whose metadata exists but no items joined them', () => {
		const result = groupMenuItems( fixtureMenuWithEmptyGroup, fixtureGroups );
		expect( result.groupedSections ).toEqual( [] );
		expect( result.ungroupedItems.map( ( item ) => item.slug ) ).toEqual( [
			'dashboard',
			'posts',
		] );
	} );

	it( 'handles a group with no attention (collapsed-state dot suppressed)', () => {
		const menu = [
			{ slug: 'home', title: 'Home', type: 'menu-item', group_id: null },
			{ slug: 'addon-a', title: 'Add-on A', type: 'menu-item', group_id: 'addons' },
		];
		const { groupedSections } = groupMenuItems( menu, fixtureGroupsNoAttention );
		expect( groupedSections ).toHaveLength( 1 );
		expect( groupedSections[ 0 ].group.signal.attention ).toBe( false );
		expect( groupedSections[ 0 ].group.default_expanded ).toBe( false );
	} );

	it( 'preserves orphan items whose group_id has no metadata as ungrouped items', () => {
		// Defensive degradation: if the endpoint returns items referencing a
		// group_id that isn't listed in groups[], we don't drop them silently.
		// Items lacking group metadata fall through to `ungroupedItems`.
		const result = groupMenuItems( fixtureMenuOrphanGroup, [] );
		expect( result.groupedSections ).toEqual( [] );
		expect( result.ungroupedItems.map( ( item ) => item.slug ) ).toEqual( [
			'dashboard',
			'orphan-1',
			'orphan-2',
		] );
	} );

	it( 'is referentially transparent: same input → equal output', () => {
		const a = groupMenuItems( fixtureMenu, fixtureGroups );
		const b = groupMenuItems( fixtureMenu, fixtureGroups );
		expect( a ).toEqual( b );
	} );

	it( 'tolerates undefined/missing group_id (treats as ungrouped)', () => {
		const menu = [
			{ slug: 'a', title: 'A', type: 'menu-item' },
			{ slug: 'b', title: 'B', type: 'menu-item', group_id: undefined },
			{ slug: 'c', title: 'C', type: 'menu-item', group_id: 'plugins' },
		];
		const result = groupMenuItems( menu, fixtureGroups );
		expect( result.ungroupedItems.map( ( item ) => item.slug ) ).toEqual( [ 'a', 'b' ] );
		expect( result.groupedSections[ 0 ].items.map( ( item ) => item.slug ) ).toEqual( [ 'c' ] );
	} );
} );
