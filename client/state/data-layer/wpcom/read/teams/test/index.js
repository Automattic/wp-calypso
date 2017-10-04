/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { handleTeamsRequest, teamRequestFailure, teamRequestReceived } from '../';
import { READER_TEAMS_RECEIVE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';

const apiResponse = { teams: [ { slug: 'a8c', title: 'Automattic' } ] };

describe( 'wpcom-api', () => {
	describe( 'teams request', () => {
		const action = { type: 'DUMMY_ACTION' };

		it( 'should dispatch HTTP request to teams endpoint', () => {
			const dispatch = spy();
			handleTeamsRequest( { dispatch }, action );
			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				http(
					{
						method: 'GET',
						path: '/read/teams',
						apiVersion: '1.2',
					},
					action
				)
			);
		} );

		it( 'should dispatch READER_TEAMS_RECEIVE action with error when request errors', () => {
			const dispatch = spy();
			teamRequestFailure( { dispatch }, action );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( {
				type: READER_TEAMS_RECEIVE,
				payload: action,
				error: true,
			} );
		} );

		it( 'should dispatch READER_TEAMS_RECEIVE action without error when request succeeds', () => {
			const dispatch = spy();
			teamRequestReceived( { dispatch }, action, apiResponse );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( {
				type: READER_TEAMS_RECEIVE,
				payload: apiResponse,
			} );
		} );
	} );
} );
