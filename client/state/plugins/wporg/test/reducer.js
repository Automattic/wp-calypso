/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items, fetchingItems } from '../reducer';
import { PLUGINS_WPORG_PLUGIN_RECEIVE, FETCH_WPORG_PLUGIN_DATA } from 'calypso/state/action-types';

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
				type: FETCH_WPORG_PLUGIN_DATA,
				pluginSlug: 'akismet',
			} );
			expect( state ).to.deep.equal( { akismet: true } );
		} );
		test( 'keeps track of multiple plugins', () => {
			const originalState = deepFreeze( { akismet: true } );
			const state = fetchingItems( originalState, {
				type: FETCH_WPORG_PLUGIN_DATA,
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
} );
