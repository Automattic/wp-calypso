/**
 * @jest-environment jsdom
 */
import deepFreeze from 'deep-freeze';
import {
	fixtureMenu,
	fixtureGroups,
} from 'calypso/my-sites/sidebar/utils/test/fixtures/grouped-menu-fixture';
import { getGroupedAdminMenu } from '../selectors/grouped';

describe( 'getGroupedAdminMenu()', () => {
	it( 'returns null when no menu is cached for the siteId', () => {
		const state = deepFreeze( {
			adminMenu: { menus: {} },
		} );
		expect( getGroupedAdminMenu( state, 12345 ) ).toBeNull();
	} );

	it( 'returns null when siteId is falsy', () => {
		const state = deepFreeze( { adminMenu: { menus: { 12345: fixtureMenu } } } );
		expect( getGroupedAdminMenu( state, null ) ).toBeNull();
		expect( getGroupedAdminMenu( state, undefined ) ).toBeNull();
	} );

	it( 'returns the partitioned shape when groups[] is passed explicitly', () => {
		const state = deepFreeze( {
			adminMenu: { menus: { 12345: fixtureMenu } },
		} );
		const result = getGroupedAdminMenu( state, 12345, fixtureGroups );
		expect( result ).not.toBeNull();
		expect( result?.ungroupedItems.map( ( item ) => item.slug ) ).toEqual( [
			'dashboard',
			'posts',
			'users',
		] );
		expect( result?.groupedSections ).toHaveLength( 1 );
		expect( result?.groupedSections[ 0 ].group.id ).toBe( 'plugins' );
	} );

	it( 'reads groups[] from state.adminMenu.groupsBySite when not passed explicitly', () => {
		const state = deepFreeze( {
			adminMenu: {
				menus: { 12345: fixtureMenu },
				groupsBySite: { 12345: fixtureGroups },
			},
		} );
		const result = getGroupedAdminMenu( state, 12345 );
		expect( result?.groupedSections ).toHaveLength( 1 );
		expect( result?.groupedSections[ 0 ].group.label ).toBe( 'My Plugins' );
	} );

	it( 'falls back to ungrouped-only when no groups[] is available anywhere', () => {
		const state = deepFreeze( {
			adminMenu: { menus: { 12345: fixtureMenu } },
		} );
		const result = getGroupedAdminMenu( state, 12345 );
		expect( result?.groupedSections ).toEqual( [] );
		expect( result?.ungroupedItems ).toHaveLength( fixtureMenu.length );
	} );

	it( 'memoises: same inputs return same object identity', () => {
		const state = deepFreeze( {
			adminMenu: {
				menus: { 12345: fixtureMenu },
				groupsBySite: { 12345: fixtureGroups },
			},
		} );
		const first = getGroupedAdminMenu( state, 12345 );
		const second = getGroupedAdminMenu( state, 12345 );
		expect( first ).toBe( second );
	} );
} );
