/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { requestEmailVerification, handleSuccess, handleError } from '../';
import {
	EMAIL_VERIFY_REQUEST_SUCCESS,
	EMAIL_VERIFY_REQUEST_FAILURE,
} from 'client/state/action-types';
import { http } from 'client/state/data-layer/wpcom-http/actions';

describe( 'send-email-verification', () => {
	describe( '#requestEmailVerification', () => {
		const dispatchSpy = spy();
		const dummyAction = { type: 'DUMMY' };

		requestEmailVerification( { dispatch: dispatchSpy }, dummyAction );

		test( 'should dispatch HTTP request to plans endpoint', () => {
			expect( dispatchSpy ).to.have.been.calledOnce;
			expect( dispatchSpy ).to.have.been.calledWith(
				http(
					{
						apiVersion: '1.1',
						method: 'POST',
						path: '/me/send-verification-email',
					},
					dummyAction
				)
			);
		} );
	} );

	describe( '#handleError', () => {
		const dispatchSpy = spy();
		const message = 'This is an error message.';
		const rawError = Error( message );

		handleError( { dispatch: dispatchSpy }, null, rawError );

		test( 'should dispatch failure action with error message', () => {
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: EMAIL_VERIFY_REQUEST_FAILURE,
				message,
			} );
		} );
	} );

	describe( '#handleSuccess', () => {
		const dispatchSpy = spy();

		handleSuccess( { dispatch: dispatchSpy } );

		test( 'should dispatch failure action with error message', () => {
			expect( dispatchSpy ).to.have.been.calledWith( { type: EMAIL_VERIFY_REQUEST_SUCCESS } );
		} );
	} );
} );
