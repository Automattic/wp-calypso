/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	SITE_RECEIVE,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_FAILURE,
	SITES_REQUEST_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { items, fetchingItems } from '../reducer';

describe( 'reducer', () => {
	before( function() {
		sinon.stub( console, 'warn' );
	} );
	after( function() {
		console.warn.restore();
	} );

	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'domains',
			'fetchingItems',
			'items',
			'mediaStorage',
			'plans',
			'vouchers'
		] );
	} );

	describe( '#fetchingItems()', () => {
		it( 'should default an empty object', () => {
			const state = fetchingItems( undefined, {} );
			expect( state ).to.eql( {} );
		} );
		it( 'should update fetching state on fetch', () => {
			const state = fetchingItems( undefined, {
				type: SITES_REQUEST
			} );
			expect( state ).to.eql( { all: true } );
		} );
		it( 'should update fetching state on success', () => {
			const original = { all: true };
			const state = fetchingItems( original, {
				type: SITES_REQUEST_SUCCESS
			} );
			expect( state ).to.eql( { all: false } );
		} );
		it( 'should update fetching state on failure', () => {
			const original = { all: true };
			const state = fetchingItems( original, {
				type: SITES_REQUEST_FAILURE
			} );
			expect( state ).to.eql( { all: false } );
		} );
		it( 'should never persist state', () => {
			const original = { all: true };
			const state = fetchingItems( original, {
				type: SERIALIZE
			} );
			expect( state ).to.eql( {} );
		} );
		it( 'should never load persisted state', () => {
			const original = { all: true };
			const state = fetchingItems( original, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'can receive all sites', () => {
			const state = items( undefined, {
				type: SITES_RECEIVE,
				sites: [
					{ ID: 2916284, name: 'WordPress.com Example Blog' },
					{ ID: 77203074, name: 'Another test site' }
				]
			} );
			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Another test site' }
			} );
		} );

		it( 'overwrites sites when all sites are received', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Another test site' }
			} );
			const state = items( original, {
				type: SITES_RECEIVE,
				sites: [
					{ ID: 77203074, name: 'A Bowl of Pho' }
				]
			} );
			expect( state ).to.eql( {
				77203074: { ID: 77203074, name: 'A Bowl of Pho' }
			} );
		} );

		it( 'should index sites by ID', () => {
			const state = items( undefined, {
				type: SITE_RECEIVE,
				site: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should accumulate sites', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
			const state = items( original, {
				type: SITE_RECEIVE,
				site: { ID: 77203074, name: 'Just You Wait' }
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Just You Wait' }
			} );
		} );

		it( 'should override previous site of same ID', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
			const state = items( original, {
				type: SITE_RECEIVE,
				site: { ID: 2916284, name: 'Just You Wait' }
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'Just You Wait' }
			} );
		} );

		it( 'should strip invalid keys on the received site object', () => {
			const state = items( undefined, {
				type: SITE_RECEIVE,
				site: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					updateComputedAttributes() {}
				}
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should strip invalid keys on the received site objects', () => {
			const state = items( undefined, {
				type: SITES_RECEIVE,
				sites: [ {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					updateComputedAttributes() {}
				} ]
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should update properties when wordads is activated', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog', options: { foo: 'bar' } }
			} );
			const state = items( original, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog', options: { foo: 'bar', wordads: true} }
			} );
		} );

		it( 'should do nothing when site is not loaded and wordads is activated', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
			const state = items( original, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 77203074
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog'
				}
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog'
				}
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should return initial state when state is invalid', () => {
			const original = deepFreeze( {
				2916284: { bad: true }
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
