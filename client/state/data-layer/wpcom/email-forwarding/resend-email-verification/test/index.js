/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	requestResendEmailVerification,
	resendEmailVerificationFailure,
	resendEmailVerificationSuccess,
} from '../';
import {
	EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST,
	EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_SUCCESS,
	EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { isSuccessNotice, isErrorNotice, noticeHasText } from '../../test-utils';

import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'email forwarding resend verification email request', () => {
		const domainName = 'example.com';
		const mailbox = 'test';
		const destination = '123@abc.com';
		const action = {
			type: EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST,
			domainName,
			mailbox,
			destination,
		};

		describe( '#requestResendEmailVerification', () => {
			test( 'should dispatch an HTTP request to the email forward resend-verification endpoint', () => {
				expect( requestResendEmailVerification( action ) ).to.eql(
					http(
						{
							method: 'POST',
							path: '/domains/example.com/email/test/resend-verification',
							body: {},
						},
						action
					)
				);
			} );
		} );

		describe( '#resendEmailVerificationFailure', () => {
			const message = 'An error has occured';

			test( 'should dispatch a error notice and resend email verification failure action on error', () => {
				const resultActions = resendEmailVerificationFailure( action, { message } );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_FAILURE,
					domainName,
					mailbox,
					destination,
					error: { message },
				} );
			} );
		} );

		describe( '#resendEmailVerificationSuccess', () => {
			test( 'should dispatch a success notice and a resend email verification success action on a good response', () => {
				const resultActions = resendEmailVerificationSuccess( action, { sent: true } );

				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isSuccessNotice( resultActions[ 0 ] ) ).to.be.true;
				expect(
					noticeHasText(
						resultActions[ 0 ],
						'Successfully sent confirmation email for test@example.com to 123@abc.com.'
					)
				).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_SUCCESS,
					domainName,
					mailbox,
					destination,
				} );
			} );

			test( 'should dispatch a error notice and a resend email verification failure action on response with sent: false', () => {
				const resultActions = resendEmailVerificationSuccess( action, { sent: false } );

				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_FAILURE,
					domainName,
					mailbox,
					destination,
					error: true,
				} );
			} );

			test( 'should dispatch a error notice and a resend email verification failure action on no response', () => {
				const resultActions = resendEmailVerificationSuccess( action, undefined );

				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_FAILURE,
					domainName,
					mailbox,
					destination,
					error: true,
				} );
			} );
		} );
	} );
} );
