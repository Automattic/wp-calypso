/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { fetchingItems, fetchingLists, items, lists, listsPagination } from '../reducer';
import {
	PLUGINS_WPORG_LIST_RECEIVE,
	PLUGINS_WPORG_LIST_REQUEST,
	PLUGINS_WPORG_PLUGIN_RECEIVE,
	PLUGINS_WPORG_PLUGIN_REQUEST,
} from 'calypso/state/action-types';

describe( 'wporg reducer', () => {
	describe( 'items', () => {
		test( 'should store plugin', () => {
			const state = items( undefined, {
				type: PLUGINS_WPORG_PLUGIN_RECEIVE,
				pluginSlug: 'akismet',
				data: { name: 'Akismet' },
			} );
			expect( state ).to.deep.equal( { akismet: { name: 'Akismet', wporg: true, fetched: true } } );
		} );
		test( 'should store plugin without data', () => {
			const state = items( undefined, {
				type: PLUGINS_WPORG_PLUGIN_RECEIVE,
				pluginSlug: 'dolly',
			} );
			expect( state ).to.deep.equal( { dolly: { wporg: false, fetched: false } } );
		} );
		test( 'should store multiple plugins', () => {
			const originalState = deepFreeze( { dolly: { wporg: false, fetched: false } } );
			const state = items( originalState, {
				type: PLUGINS_WPORG_PLUGIN_RECEIVE,
				pluginSlug: 'akismet',
				data: { name: 'Akismet' },
			} );
			expect( state ).to.deep.equal( {
				akismet: { name: 'Akismet', wporg: true, fetched: true },
				dolly: { wporg: false, fetched: false },
			} );
		} );
	} );

	describe( 'fetchingItems', () => {
		test( 'should track when fetches start', () => {
			const state = fetchingItems( undefined, {
				type: PLUGINS_WPORG_PLUGIN_REQUEST,
				pluginSlug: 'akismet',
			} );
			expect( state ).to.deep.equal( { akismet: true } );
		} );
		test( 'keeps track of multiple plugins', () => {
			const originalState = deepFreeze( { akismet: true } );
			const state = fetchingItems( originalState, {
				type: PLUGINS_WPORG_PLUGIN_REQUEST,
				pluginSlug: 'dolly',
			} );
			expect( state ).to.deep.equal( { akismet: true, dolly: true } );
		} );
		test( 'should track when fetches end', () => {
			const originalState = deepFreeze( { akismet: true } );
			const state = fetchingItems( originalState, {
				type: PLUGINS_WPORG_PLUGIN_RECEIVE,
				pluginSlug: 'akismet',
			} );
			expect( state ).to.deep.equal( { akismet: false } );
		} );
		test( 'should track when fetches end for many plugins', () => {
			const originalState = deepFreeze( { akismet: true } );
			const state = fetchingItems( originalState, {
				type: PLUGINS_WPORG_PLUGIN_RECEIVE,
				pluginSlug: 'dolly',
			} );
			expect( state ).to.deep.equal( { akismet: true, dolly: false } );
		} );
	} );

	describe( 'fetchingLists', () => {
		test( 'should track category list fetches when they start', () => {
			const state = fetchingLists( undefined, {
				type: PLUGINS_WPORG_LIST_REQUEST,
				category: 'popular',
			} );
			expect( state ).to.deep.equal( { category: { popular: true } } );
		} );
		test( 'should track search term list fetches when they start', () => {
			const originalState = deepFreeze( { category: { popular: true } } );
			const state = fetchingLists( originalState, {
				type: PLUGINS_WPORG_LIST_REQUEST,
				searchTerm: 'security',
			} );
			expect( state ).to.deep.equal( {
				category: { popular: true },
				search: { security: true },
			} );
		} );
		test( 'should track category list fetches when they end', () => {
			const originalState = deepFreeze( {
				category: { popular: true },
				search: { security: true },
			} );
			const state = fetchingLists( originalState, {
				type: PLUGINS_WPORG_LIST_RECEIVE,
				category: 'popular',
			} );
			expect( state ).to.deep.equal( {
				category: { popular: false },
				search: { security: true },
			} );
		} );
		test( 'should track search term list fetches when they end', () => {
			const originalState = deepFreeze( {
				category: { popular: true },
				search: { security: true },
			} );
			const state = fetchingLists( originalState, {
				type: PLUGINS_WPORG_LIST_RECEIVE,
				searchTerm: 'security',
			} );
			expect( state ).to.deep.equal( {
				category: { popular: true },
				search: { security: false },
			} );
		} );
	} );

	describe( 'lists', () => {
		test( 'should store plugin lists by category', () => {
			const state = lists( undefined, {
				type: PLUGINS_WPORG_LIST_RECEIVE,
				category: 'popular',
				data: [ { name: 'Akismet', slug: 'akismet' } ],
			} );
			expect( state ).to.deep.equal( {
				category: { popular: [ { name: 'Akismet', slug: 'akismet' } ] },
			} );
		} );
		test( 'should store plugin lists by search term', () => {
			const state = lists( undefined, {
				type: PLUGINS_WPORG_LIST_RECEIVE,
				searchTerm: 'security',
				data: [ { name: 'Jetpack', slug: 'jetpack' } ],
			} );
			expect( state ).to.deep.equal( {
				search: { security: [ { name: 'Jetpack', slug: 'jetpack' } ] },
			} );
		} );
		test( 'should store plugin lists by multiple categories', () => {
			const state = lists(
				{
					category: { popular: [ { name: 'Akismet', slug: 'akismet' } ] },
				},
				{
					type: PLUGINS_WPORG_LIST_RECEIVE,
					category: 'new',
					data: [ { name: 'Jetpack', slug: 'jetpack' } ],
				}
			);
			expect( state ).to.deep.equal( {
				category: {
					popular: [ { name: 'Akismet', slug: 'akismet' } ],
					new: [ { name: 'Jetpack', slug: 'jetpack' } ],
				},
			} );
		} );
		test( 'should store plugin lists by multiple search terms', () => {
			const state = lists(
				{
					search: { security: [ { name: 'Akismet', slug: 'akismet' } ] },
				},
				{
					type: PLUGINS_WPORG_LIST_RECEIVE,
					searchTerm: 'enhancement',
					data: [ { name: 'Jetpack', slug: 'jetpack' } ],
				}
			);
			expect( state ).to.deep.equal( {
				search: {
					security: [ { name: 'Akismet', slug: 'akismet' } ],
					enhancement: [ { name: 'Jetpack', slug: 'jetpack' } ],
				},
			} );
		} );
		test( 'should paginate plugin lists for categories', () => {
			const state = lists(
				{
					category: { popular: [ { name: 'Akismet', slug: 'akismet' } ] },
				},
				{
					type: PLUGINS_WPORG_LIST_RECEIVE,
					category: 'popular',
					page: 2,
					data: [ { name: 'Jetpack', slug: 'jetpack' } ],
				}
			);
			expect( state ).to.deep.equal( {
				category: {
					popular: [
						{ name: 'Akismet', slug: 'akismet' },
						{ name: 'Jetpack', slug: 'jetpack' },
					],
				},
			} );
		} );
		test( 'should overwrite plugin lists for categories if first page', () => {
			const state = lists(
				{
					category: { popular: [ { name: 'Akismet', slug: 'akismet' } ] },
				},
				{
					type: PLUGINS_WPORG_LIST_RECEIVE,
					category: 'popular',
					page: 1,
					data: [ { name: 'Jetpack', slug: 'jetpack' } ],
				}
			);
			expect( state ).to.deep.equal( {
				category: {
					popular: [ { name: 'Jetpack', slug: 'jetpack' } ],
				},
			} );
		} );
		test( 'should overwrite plugin lists for search terms', () => {
			const state = lists(
				{
					search: { security: [ { name: 'Akismet', slug: 'akismet' } ] },
				},
				{
					type: PLUGINS_WPORG_LIST_RECEIVE,
					searchTerm: 'security',
					data: [ { name: 'Jetpack', slug: 'jetpack' } ],
				}
			);
			expect( state ).to.deep.equal( {
				search: {
					security: [ { name: 'Jetpack', slug: 'jetpack' } ],
				},
			} );
		} );
	} );

	describe( 'listsPagination', () => {
		const pagination = {
			page: 1,
			pages: 100,
			results: 2359,
		};
		const pagination2 = {
			...pagination,
			page: 2,
		};

		test( 'should store plugin list pagination by category', () => {
			const state = listsPagination( undefined, {
				type: PLUGINS_WPORG_LIST_RECEIVE,
				category: 'popular',
				pagination,
			} );
			expect( state ).to.deep.equal( {
				category: { popular: pagination },
			} );
		} );
		test( 'should store plugin list pagination by multiple categories', () => {
			const state = listsPagination(
				{
					category: { popular: pagination },
				},
				{
					type: PLUGINS_WPORG_LIST_RECEIVE,
					category: 'new',
					pagination: pagination2,
				}
			);
			expect( state ).to.deep.equal( {
				category: {
					popular: pagination,
					new: pagination2,
				},
			} );
		} );
		test( 'should overwrite existing plugin list paginations', () => {
			const state = listsPagination(
				{
					category: {
						popular: pagination,
						new: pagination,
					},
				},
				{
					type: PLUGINS_WPORG_LIST_RECEIVE,
					category: 'popular',
					pagination: pagination2,
				}
			);
			expect( state ).to.deep.equal( {
				category: {
					popular: pagination2,
					new: pagination,
				},
			} );
		} );
	} );
} );
