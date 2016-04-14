/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { SITE_RECEIVE, SERIALIZE, DESERIALIZE } from 'state/action-types';
import reducer, { items } from '../reducer';

describe( 'reducer', () => {
	before( function() {
		sinon.stub( console, 'warn' );
	} );
	after( function() {
		console.warn.restore();
	} );

	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'items',
			'mediaStorage',
			'plans'
		] );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
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
					slug: 'example.wordpress.com',
					updateComputedAttributes() {}
				}
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog', slug: 'example.wordpress.com' }
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
