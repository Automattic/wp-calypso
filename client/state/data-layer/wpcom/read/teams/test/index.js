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
import { READER_TEAMS_REQUEST, READER_TEAMS_RECEIVE } from 'state/action-types';

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
	describe( 'teams request', () => {
		useNock( nock => (
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/teams' )
				.reply( 200, successfulResponse )
				.get( '/rest/v1.2/read/teams' )
				.reply( 500, new Error() )
		) );

		it( 'should dispatch RECEIVE action when request completes', ( done ) => {
			const requestAction = requestTeams();
			const nextSpy = sinon.spy();
			const dispatch = sinon.spy( action => {
				if ( action.type === READER_TEAMS_RECEIVE ) {
					expect( dispatch ).to.have.been.calledWith( {
						type: READER_TEAMS_RECEIVE,
						payload: successfulResponse,
						error: false,
						meta: { requestEnd: READER_TEAMS_REQUEST },
					} );
					expect( nextSpy ).to.have.been.calledWith( requestAction );
					done();
				}
			} );

			handleTeamsRequest( { dispatch }, requestAction, nextSpy, );
		} );

		it( 'should dispatch RECEIVE action with error when request errors', ( done ) => {
			const requestAction = requestTeams();
			const nextSpy = sinon.spy();
			const dispatch = sinon.spy( action => {
				if ( action.type === READER_TEAMS_RECEIVE ) {
					expect( dispatch ).to.have.been.calledWith( {
						type: READER_TEAMS_RECEIVE,
						payload: sinon.match.any,
						error: true,
						meta: { requestEnd: READER_TEAMS_REQUEST },
					} );
					expect( nextSpy ).to.have.been.calledWith( requestAction );
					done();
				}
			} );

			handleTeamsRequest( { dispatch }, requestAction, nextSpy, );
		} );
	} );
} );
