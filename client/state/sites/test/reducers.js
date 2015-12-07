/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { RECEIVE_SITE } from '../action-types';
import { byId } from '../reducers';

describe( 'reducers', () => {
	describe( '#byId()', () => {
		it( 'should default to an empty object', () => {
			const state = byId( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index sites by ID', () => {
			const state = byId( null, {
				type: RECEIVE_SITE,
				site: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should return a new instance of the state object', () => {
			const original = {};
			const state = byId( original, {
				type: RECEIVE_SITE,
				site: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );

			expect( state ).to.not.equal( original );
		} );

		it( 'should accumulate sites', () => {
			const state = byId( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			}, {
				type: RECEIVE_SITE,
				site: { ID: 77203074, name: 'Just You Wait' }
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Just You Wait' }
			} );
		} );

		it( 'should override previous site of same ID', () => {
			const state = byId( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			}, {
				type: RECEIVE_SITE,
				site: { ID: 2916284, name: 'Just You Wait' }
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'Just You Wait' }
			} );
		} );
	} );
} );
