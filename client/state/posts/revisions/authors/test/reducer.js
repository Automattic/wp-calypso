/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { receivePostRevisionAuthors } from '../actions';
import { POST_REVISION_AUTHORS_RECEIVE } from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should index users by ID', () => {
			const state = items( null, {
				type: POST_REVISION_AUTHORS_RECEIVE,
				users: [ { ID: 73705554, login: 'testonesite2014' } ],
			} );

			expect( state ).toEqual( {
				73705554: { ID: 73705554, login: 'testonesite2014' },
			} );
		} );

		test( 'should accumulate users', () => {
			const original = Object.freeze( {
				73705554: { ID: 73705554, login: 'testonesite2014' },
			} );

			const state = items( original, {
				type: POST_REVISION_AUTHORS_RECEIVE,
				users: [ { ID: 73705672, login: 'testtwosites2014' } ],
			} );

			expect( state ).toEqual( {
				73705554: { ID: 73705554, login: 'testonesite2014' },
				73705672: { ID: 73705672, login: 'testtwosites2014' },
			} );
		} );

		test( 'should override previous user of same ID', () => {
			const original = Object.freeze( {
				73705554: { ID: 73705554, login: 'testonesite2014' },
			} );

			const state = items( original, {
				type: POST_REVISION_AUTHORS_RECEIVE,
				users: [ { ID: 73705554, login: 'testtwosites2014' } ],
			} );

			expect( state ).toEqual( {
				73705554: { ID: 73705554, login: 'testtwosites2014' },
			} );
		} );

		test( 'should receive list of users', () => {
			const original = Object.freeze( {
				73705554: { ID: 73705554, login: 'testonesite2014' },
			} );

			const state = items(
				original,
				receivePostRevisionAuthors( [
					{ ID: 73705554, login: 'testtwosites2014' },
					{ ID: 73705672, login: 'testthreesites2018' },
				] )
			);

			expect( state ).toEqual( {
				73705554: { ID: 73705554, login: 'testtwosites2014' },
				73705672: { ID: 73705672, login: 'testthreesites2018' },
			} );
		} );
	} );
} );
