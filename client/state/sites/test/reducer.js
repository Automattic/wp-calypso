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
import { items } from '../reducer';

describe( 'reducer', () => {
	before( function() {
		sinon.stub( console, 'warn' );
	} );
	after( function() {
		console.warn.restore();
	} );
	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index sites by ID', () => {
			const state = items( null, {
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
		describe( 'persistence', () => {
			it( 'does not persist state because this is not implemented yet', () => {
				const original = deepFreeze( {
					2916284: {
						ID: 2916284,
						name: 'WordPress.com Example Blog',
						somethingDecoratedMe: () => {
						}
					}
				} );
				const state = items( original, { type: SERIALIZE } );
				expect( state ).to.eql( {} );
			} );
			it( 'does not load persisted state because this is not implemented yet', () => {
				const original = deepFreeze( {
					2916284: {
						ID: 2916284,
						name: 'WordPress.com Example Blog'
					},
					2916285: {
						ID: 2916285,
						name: 'WordPress.com Example Blog 2'
					}
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
			it.skip( 'returns initial state when state is missing required properties', () => {
				const original = deepFreeze( {
					2916284: { name: 'WordPress.com Example Blog' }
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
			it.skip( 'returns initial state when state has invalid keys', () => {
				const original = deepFreeze( {
					foobar: { name: 'WordPress.com Example Blog' }
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );
} );
