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

// TODO what should these be named ?
describe( 'wpcom-api', () => {
	const dispatchSpy = sinon.spy();
	const nextSpy = sinon.spy();

	describe( 'teams request', () => {
		useNock( nock => (
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/teams' )
				.reply( 200, successfulResponse )
				.get( '/rest/v1.2/read/teams' )
				.reply( 500, new Error() )
		) );

		it( 'should dispatch RECEIVE action when request completes', () => {
			return handleTeamsRequest( { dispatch: dispatchSpy }, requestTeams(), nextSpy, )
				.then( () => (
					expect( dispatchSpy ).to.have.been.calledWith( {
						type: READER_TEAMS_RECEIVE,
						payload: successfulResponse,
					} )
				) );
		} );

		it( 'should dispatch RECEIVE action with error when request errors', () => {
			return handleTeamsRequest( { dispatch: dispatchSpy }, requestTeams(), nextSpy, )
				.then( () => (
					expect( dispatchSpy ).to.have.been.calledWith( {
						type: READER_TEAMS_RECEIVE,
						payload: sinon.match.any,
						error: true,
					} )
				) );
		} );
	} );
} );
