/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { SITE_RECEIVE, SERIALIZE, DESERIALIZE } from 'state/action-types';

let items;
describe( 'reducer', () => {
	before( function() {
		mockery.registerMock( 'lib/warn', () => {} );
		mockery.enable( { warnOnReplace: false, warnOnUnregistered: false } );
		items = require( '../reducer' ).items;
	} );
	after( function() {
		mockery.deregisterAll();
		mockery.disable();
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
			it( 'should return a js object on SERIALIZE', () => {
				const original = deepFreeze( {
					2916284: {
						ID: 2916284,
						name: 'WordPress.com Example Blog',
						somethingDecoratedMe: () => {
						}
					}
				} );
				const state = items( original, { type: SERIALIZE } );
				expect( state ).to.eql( {
					2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
				} );
			} );
			it( 'validates state on DESERIALIZE', () => {
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
				expect( state ).to.eql( {
					2916284: {
						ID: 2916284,
						name: 'WordPress.com Example Blog'
					},
					2916285: {
						ID: 2916285,
						name: 'WordPress.com Example Blog 2'
					}
				} );
			} );
			it( 'returns initial state when state is missing required properties', () => {
				const original = deepFreeze( {
					2916284: { name: 'WordPress.com Example Blog' }
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
			it( 'returns initial state when state has invalid keys', () => {
				const original = deepFreeze( {
					foobar: { name: 'WordPress.com Example Blog' }
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );
} );
