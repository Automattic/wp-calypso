/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';

import { handleTeamsRequest } from '../';
import { requestTeams } from 'state/reader/teams/actions';
import { READER_TEAMS_RECEIVE } from 'state/action-types';

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

	describe( 'teams request', () => {
		useNock( nock => (
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/teams' )
				.reply( 200, successfulResponse )
				.get( '/rest/v1.2/read/teams' )
				.reply( 200, successfulResponse )
				.get( '/rest/v1.2/read/teams' )
				.reply( 500, new Error() )
		) );

		it( 'handleTeamsRequest should pass the action forward', () => {
			const dispatch = sinon.spy();
			const action = requestTeams();

			handleTeamsRequest( { dispatch }, action, nextSpy, );
			expect( nextSpy ).calledWith( action );
		} );

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
} );
