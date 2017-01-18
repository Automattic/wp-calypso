/**
 * External dependencies
 */
import sinon from 'sinon';
import { assert, expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import {
	READER_TEAMS_REQUEST,
	READER_TEAMS_REQUEST_FAILURE,
	READER_TEAMS_REQUEST_SUCCESS,
} from 'state/action-types';
import { requestTeams } from '../actions';
import { successfulResponse } from './sample-responses';

describe( 'actions', () => {
	const dispatchSpy = sinon.spy();

	beforeEach( () => {
		dispatchSpy.reset();
	} );

	describe( 'requestTeams', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/teams' )
				.reply( 200, deepFreeze( successfulResponse ) )
				.get( '/rest/v1.2/read/teams' )
				.reply( 500, deepFreeze( { error: new Error( 'sample error' ) } ) );
		} );

		it( 'request should dispatch success when api succeeds', () => {
			const request = requestTeams()( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_TEAMS_REQUEST,
			} );

			return request.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_TEAMS_REQUEST_SUCCESS,
					teams: [ { title: 'Automattic', slug: 'a8c' } ],
					number: 1,
				} );

				expect( dispatchSpy.calledTwice );
			} ).catch( ( err ) => {
				assert.fail( err, undefined, 'errback should not have been called' );
			} );
		} );

		it( 'request should dispatch failure when api fails', () => {
			const request = requestTeams()( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_TEAMS_REQUEST,
			} );

			return request.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_TEAMS_REQUEST_FAILURE,
					error: sinon.match.any,
				} );

				expect( dispatchSpy.calledTwice );
			} ).catch( ( err ) => {
				assert.fail( err, undefined, 'errback should not have been called' );
			} );
		} );
	} );
} );
