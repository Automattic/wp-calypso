/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	handleValidateRequest,
	handleValidateRequestSuccess,
	handleValidateRequestFailure,
} from '../';
import {
	validateRequestSuccess,
	validateRequestError,
	setValidationKey,
} from 'client/state/account-recovery/reset/actions';
import { http } from 'client/state/data-layer/wpcom-http/actions';

describe( 'handleValidateRequest()', () => {
	describe( 'success', () => {
		test( 'should dispatch SUCCESS action on success', () => {
			const dispatch = spy();
			const action = {
				type: 'DUMMY_ACTION',
				userData: { user: 'foo' },
				method: 'primary_email',
				key: 'a-super-secret-key',
			};
			const { userData, method, key } = action;

			handleValidateRequest( { dispatch }, action );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				http(
					{
						method: 'POST',
						apiNamespace: 'wpcom/v2',
						path: '/account-recovery/validate',
						body: {
							...userData,
							method,
							key,
						},
					},
					action
				)
			);
		} );

		test( 'should dispatch SET_VALIDATION_KEY action on success', () => {
			const dispatch = spy();
			const action = {
				type: 'DUMMY_ACTION',
				userData: { user: 'foo' },
				method: 'primary_email',
				key: 'a-super-secret-key',
			};

			handleValidateRequestSuccess( { dispatch }, action );

			expect( dispatch ).to.have.been.calledWith( validateRequestSuccess() );
			expect( dispatch ).to.have.been.calledWith( setValidationKey( action.key ) );
		} );

		test( 'should dispatch ERROR action on failure', () => {
			const dispatch = spy();
			const error = 'something bad happened';
			handleValidateRequestFailure( { dispatch }, {}, error );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( validateRequestError( error ) );
		} );
	} );
} );
