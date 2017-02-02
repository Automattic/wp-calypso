/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	requestTeams as requestTeamsAction,
	receiveTeams as receiveTeamsAction,
} from 'state/reader/teams/actions';

import { requestTeams, receiveTeams, receiveError } from '../';

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
		describe( '#requestTeams', () => {
			it( 'should dispatch HTTP request to plans endpoint', () => {
				const action = requestTeamsAction();
				const dispatch = sinon.spy();
				const next = sinon.spy();

				requestTeams( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.2',
					method: 'GET',
					path: '/read/teams',
					onSuccess: requestTeamsAction(),
					onFailure: requestTeamsAction(),
					dedupe: true,
				} ) );
			} );

			it( 'should pass the original action along the middleware chain', () => {
				const action = requestTeamsAction();
				const dispatch = sinon.spy();
				const next = sinon.spy();

				requestTeams( { dispatch }, action, next );

				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#receiveTeams', () => {
			it( 'should dispatch plan updates', () => {
				const apiResponse = successfulResponse;
				const action = requestTeamsAction();
				const dispatch = sinon.spy();
				const next = sinon.spy();

				receiveTeams( { dispatch }, action, next, apiResponse );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveTeamsAction( { payload: apiResponse, error: false } )
				);
			} );
		} );

		describe( '#receiveError', () => {
			it( 'should dispatch error', () => {
				const error = 'could not find teams';
				const action = requestTeamsAction();
				const dispatch = sinon.spy();
				const next = sinon.spy();

				receiveError( { dispatch }, action, next, error );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveTeamsAction( { payload: error, error: true } )
				);
			} );
		} );
	} );
} );

