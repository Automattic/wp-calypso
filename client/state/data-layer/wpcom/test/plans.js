/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	plansReceiveAction,
} from 'state/plans/actions';

import {
	requestPlans,
} from '../plans-request';

import {
	ACTION_PLANS_REQUEST_SUCCESS,
	WPCOM_RESPONSE as wpcomResponse,
} from 'state/plans/test/fixture';

describe( 'wpcom-api', () => {
	let dispatch;

	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	describe( 'plans request', () => {
		useNock( nock => (
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.4/plans' )
				.reply( 200, wpcomResponse )
		) );

		it( 'should dispatch SUCCESS action when request completes', () => {
			return requestPlans( { dispatch } )
				.then( () => (
					expect( dispatch ).to.have.been.calledWith( ACTION_PLANS_REQUEST_SUCCESS )
				) );
		} );

		it( 'should dispatch RECEIVE action when request completes', () => {
			const plans = wpcomResponse;
			const actionResponse = plansReceiveAction( plans );

			return requestPlans( { dispatch } )
				.then( () => (
					expect( dispatch ).to.have.been.calledWith( actionResponse )
				) );
		} );
	} );
} );
