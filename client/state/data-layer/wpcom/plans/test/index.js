/** @format */
/**
 * Internal dependencies
 */
import { receivePlans, receiveError, requestPlans } from '../';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import {
	plansReceiveAction,
	plansRequestFailureAction,
	plansRequestSuccessAction,
} from 'client/state/plans/actions';
import { WPCOM_RESPONSE } from 'client/state/plans/test/fixture';

describe( 'wpcom-api', () => {
	describe( 'plans request', () => {
		describe( '#requestPlans', () => {
			test( 'should return HTTP request to plans endpoint', () => {
				const action = { type: 'DUMMY' };

				expect( requestPlans( action ) ).toEqual(
					http(
						{
							apiVersion: '1.4',
							method: 'GET',
							path: '/plans',
						},
						action
					)
				);
			} );
		} );

		describe( '#receivePlans', () => {
			test( 'should return plan updates', () => {
				const plans = WPCOM_RESPONSE;
				const action = plansReceiveAction( plans );

				expect( receivePlans( action, plans ) ).toEqual( [
					plansRequestSuccessAction(),
					plansReceiveAction( plans ),
				] );
			} );
		} );

		describe( '#receiveError', () => {
			test( 'should return error', () => {
				const error = 'could not find plans';
				const action = plansRequestFailureAction( error );

				expect( receiveError( action, error ) ).toEqual( plansRequestFailureAction( error ) );
			} );
		} );
	} );
} );
