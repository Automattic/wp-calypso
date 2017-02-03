/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { handleFollowsRequest } from '../';
import { requestFollows } from 'state/reader/follows/actions';
import { READER_FOLLOWS_RECEIVE } from 'state/action-types';

const successfulResponse = require( './sample-success-response.json' );

describe( 'wpcom-api', () => {
	const nextSpy = sinon.spy();

	describe( 'follows request', () => {
		useNock( nock => (
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/following/mine' )
				.reply( 200, deepFreeze( successfulResponse ) )
				.get( '/rest/v1.2/read/following/mine' )
				.reply( 500, new Error() )
		) );

		it( 'should dispatch RECEIVE action when request completes', ( done ) => {
			const dispatch = sinon.spy( action => {
				if ( action.type === READER_FOLLOWS_RECEIVE ) {
					expect( dispatch ).to.have.been.calledWith( {
						type: READER_FOLLOWS_RECEIVE,
						payload: successfulResponse,
					} );
					done();
				}
			} );

			handleFollowsRequest( { dispatch }, requestFollows(), nextSpy, );
		} );

		it( 'should dispatch RECEIVE action with error when request errors', ( done ) => {
			const dispatch = sinon.spy( action => {
				if ( action.type === READER_FOLLOWS_RECEIVE ) {
					expect( dispatch ).to.have.been.calledWith( {
						type: READER_FOLLOWS_RECEIVE,
						payload: sinon.match.any,
						error: true,
					} );
					done();
				}
			} );

			handleFollowsRequest( { dispatch }, requestFollows(), nextSpy, );
		} );
	} );
} );
