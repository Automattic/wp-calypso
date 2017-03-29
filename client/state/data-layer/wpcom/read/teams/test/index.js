/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { defer } from 'lodash';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import useMockery from 'test/helpers/use-mockery';

import { requestTeams } from 'state/reader/teams/actions';
import { READER_TEAMS_RECEIVE } from 'state/action-types';
let handleTeamsRequest = require( '../' ).handleTeamsRequest;

export const successfulResponse = {
	teams: [
		{
			title: 'Automattic',
			slug: 'a8c'
		}
	],
	number: 1
};

describe( 'wpcom-api', () => {
	const nextSpy = sinon.spy();

	beforeEach( () => {
		nextSpy.reset();
	} );

	describe( 'teams request', () => {
		context( 'successful queries', () => {
			useNock( nock => (
				nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1.2/read/teams' )
					.reply( 200, successfulResponse )
					.persist()
			) );

			it( 'should dispatch RECEIVE action when request completes', ( done ) => {
				const dispatch = sinon.spy( action => {
					if ( action.type === READER_TEAMS_RECEIVE ) {
						expect( dispatch ).to.have.been.calledWith( {
							type: READER_TEAMS_RECEIVE,
							payload: successfulResponse,
						} );
						done();
					}
				} );

				handleTeamsRequest( { dispatch }, requestTeams(), nextSpy, );
			} );
		} );

		context( 'unsuccessful queries', () => {
			useNock( nock => (
				nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1.2/read/teams' )
					.reply( 500, new Error() )
					.persist()
			) );

			it( 'should dispatch RECEIVE action with error when request errors', ( done ) => {
				const dispatch = sinon.spy( action => {
					if ( action.type === READER_TEAMS_RECEIVE ) {
						expect( dispatch ).to.have.been.calledWith( {
							type: READER_TEAMS_RECEIVE,
							payload: sinon.match.any,
							error: true,
						} );
						done();
					}
				} );

				handleTeamsRequest( { dispatch }, requestTeams(), nextSpy, );
			} );
		} );

		// request wont be resolved until the resolvers in promiseResolvers are manually called
		context( 'delayed queries', () => {
			const promiseResolvers = [];
			useMockery( mockery => {
				const getStub = sinon.stub();
				getStub.returns( new Promise( resolve => promiseResolvers.push( resolve ) ) );

				const wpStub = { req: { get: getStub } };
				mockery.registerMock( 'lib/wp', wpStub );

				handleTeamsRequest = require( '../' ).handleTeamsRequest;
			} );

			it( 'should dedupe actions', ( done ) => {
				const dispatch = sinon.spy( action => {
					if ( action.type === READER_TEAMS_RECEIVE && dispatch.callCount === 2 ) {
						expect( nextSpy.callCount ).to.be.equal( 2 );
						done();
					}
				} );

				handleTeamsRequest( { dispatch }, requestTeams(), nextSpy, );
				handleTeamsRequest( { dispatch }, requestTeams(), nextSpy, );
				promiseResolvers.forEach( resolve => resolve( 42 ) );
				defer( () => handleTeamsRequest( { dispatch }, requestTeams(), nextSpy, ) );
			} );
		} );
	} );
} );
