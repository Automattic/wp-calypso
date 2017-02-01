/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	plansReceiveAction,
	plansRequestFailureAction,
	plansRequestSuccessAction,
} from 'state/plans/actions';
import {
	receivePlans,
	receiveError,
	requestPlans,
} from '../';

import { WPCOM_RESPONSE } from 'state/plans/test/fixture';

describe( 'wpcom-api', () => {
	describe( 'plans request', () => {
		describe( '#requestPlans', () => {
			it( 'should dispatch HTTP request to plans endpoint', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const next = spy();

				requestPlans( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.4',
					method: 'GET',
					path: '/plans',
					onSuccess: action,
					onFailure: action,
				} ) );
			} );

			it( 'should pass the original action along the middleware chain', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const next = spy();

				requestPlans( { dispatch }, action, next );

				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#receivePlans', () => {
			it( 'should dispatch plan updates', () => {
				const plans = WPCOM_RESPONSE;
				const action = plansReceiveAction( plans );
				const dispatch = spy();
				const next = spy();

				receivePlans( { dispatch }, action, next, plans );

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
				const next = spy();

				receiveError( { dispatch }, action, next, error );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( plansRequestFailureAction( error ) );
			} );
		} );
	} );
} );
