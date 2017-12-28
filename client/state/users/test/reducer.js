/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { USER_RECEIVE } from 'client/state/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should index users by ID', () => {
			const state = items( null, {
				type: USER_RECEIVE,
				user: { ID: 73705554, login: 'testonesite2014' },
			} );

			expect( state ).to.eql( {
				73705554: { ID: 73705554, login: 'testonesite2014' },
			} );
		} );

		test( 'should accumulate users', () => {
			const original = Object.freeze( {
				73705554: { ID: 73705554, login: 'testonesite2014' },
			} );
			const state = items( original, {
				type: USER_RECEIVE,
				user: { ID: 73705672, login: 'testtwosites2014' },
			} );

			expect( state ).to.eql( {
				73705554: { ID: 73705554, login: 'testonesite2014' },
				73705672: { ID: 73705672, login: 'testtwosites2014' },
			} );
		} );

		test( 'should override previous user of same ID', () => {
			const original = Object.freeze( {
				73705554: { ID: 73705554, login: 'testonesite2014' },
			} );
			const state = items( original, {
				type: USER_RECEIVE,
				user: { ID: 73705554, login: 'testtwosites2014' },
			} );

			expect( state ).to.eql( {
				73705554: { ID: 73705554, login: 'testtwosites2014' },
			} );
		} );
	} );
} );
