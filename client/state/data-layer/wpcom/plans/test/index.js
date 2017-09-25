/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { receivePlans, receiveError, requestPlans } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { plansReceiveAction, plansRequestFailureAction, plansRequestSuccessAction } from 'state/plans/actions';
import { WPCOM_RESPONSE } from 'state/plans/test/fixture';

describe( 'wpcom-api', () => {
	describe( 'plans request', () => {
		describe( '#requestPlans', () => {
			it( 'should dispatch HTTP request to plans endpoint', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();

				requestPlans( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.4',
					method: 'GET',
					path: '/plans',
					onSuccess: action,
					onFailure: action,
				} ) );
			} );
		} );

		describe( '#receivePlans', () => {
			it( 'should dispatch plan updates', () => {
				const plans = WPCOM_RESPONSE;
				const action = plansReceiveAction( plans );
				const dispatch = spy();

				receivePlans( { dispatch }, action, plans );

				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith( plansRequestSuccessAction() );
				expect( dispatch ).to.have.been.calledWith( plansReceiveAction( plans ) );
			} );
		} );

		describe( '#receiveError', () => {
			it( 'should dispatch error', () => {
				const error = 'could not find plans';
				const action = plansRequestFailureAction( error );
				const dispatch = spy();

				receiveError( { dispatch }, action, error );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( plansRequestFailureAction( error ) );
			} );
		} );
	} );
} );
