/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	WPORG_PLUGIN_DATA_RECEIVE,
	FETCH_WPORG_PLUGIN_DATA,
} from 'state/action-types';
import { items, fetchingItems } from '../reducer';

describe( 'wporg reducer', () => {
	describe( 'items', () => {
		it( 'should store plugin', () => {
			const state = items( undefined, {
				type: WPORG_PLUGIN_DATA_RECEIVE,
				pluginSlug: 'akismet',
				data: { name: 'Akismet' }
			} );
			expect( state ).to.deep.equal( { akismet: { name: 'Akismet', wporg: true, fetched: true } } );
		} );
		it( 'should store plugin without data', () => {
			const state = items( undefined, {
				type: WPORG_PLUGIN_DATA_RECEIVE,
				pluginSlug: 'dolly'
			} );
			expect( state ).to.deep.equal( { dolly: { wporg: false, fetched: false } } );
		} );
		it( 'should store multiple plugins', () => {
			const originalState = deepFreeze( { dolly: { wporg: false, fetched: false } } );
			const state = items( originalState, {
				type: WPORG_PLUGIN_DATA_RECEIVE,
				pluginSlug: 'akismet',
				data: { name: 'Akismet' }
			} );
			expect( state ).to.deep.equal(
				{
					akismet: { name: 'Akismet', wporg: true, fetched: true },
					dolly: { wporg: false, fetched: false }
				} );
		} );
	} );
	describe( 'fetchingItems', () => {
		it( 'should track when fetches start', () => {
			const state = fetchingItems( undefined, {
				type: FETCH_WPORG_PLUGIN_DATA,
				pluginSlug: 'akismet'
			} );
			expect( state ).to.deep.equal( { akismet: true } );
		} );
		it( 'keeps track of multiple plugins', () => {
			const originalState = deepFreeze( { akismet: true } );
			const state = fetchingItems( originalState, {
				type: FETCH_WPORG_PLUGIN_DATA,
				pluginSlug: 'dolly'
			} );
			expect( state ).to.deep.equal( { akismet: true, dolly: true } );
		} );
		it( 'should track when fetches end', () => {
			const originalState = deepFreeze( { akismet: true } );
			const state = fetchingItems( originalState, {
				type: WPORG_PLUGIN_DATA_RECEIVE,
				pluginSlug: 'akismet'
			} );
			expect( state ).to.deep.equal( { akismet: false } );
		} );
		it( 'should track when fetches end for many plugins', () => {
			const originalState = deepFreeze( { akismet: true } );
			const state = fetchingItems( originalState, {
				type: WPORG_PLUGIN_DATA_RECEIVE,
				pluginSlug: 'dolly'
			} );
			expect( state ).to.deep.equal( { akismet: true, dolly: false } );
		} );
	} );
} );
