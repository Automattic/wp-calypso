/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { addEmailForward, addEmailForwardSuccess, addEmailForwardFailure } from '../';
import {
	EMAIL_FORWARDING_ADD_REQUEST,
	EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
	EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { isSuccessNotice, isErrorNotice, noticeHasText } from '../../test-utils';

import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'email forwarding add forward request', () => {
		const domainName = 'example.com';
		const mailbox = 'test';
		const destination = '123@abc.com';
		const action = {
			type: EMAIL_FORWARDING_ADD_REQUEST,
			domainName,
			mailbox,
			destination,
		};

		describe( '#addEmailForward', () => {
			test( 'should dispatch an HTTP request to the email forward new endpoint', () => {
				expect( addEmailForward( action ) ).to.eql(
					http(
						{
							method: 'POST',
							path: '/domains/example.com/email/new',
							body: {
								mailbox,
								destination,
							},
						},
						action
					)
				);
			} );
		} );

		describe( '#addEmailForwardFailure', () => {
			const message = 'An error has occured';

			test( 'should dispatch a error notice and an add email forward failure action on error', () => {
				const resultActions = addEmailForwardFailure( action, { message } );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
					domainName,
					mailbox,
					destination,
					error: { message },
				} );
			} );
		} );

		describe( '#addEmailForwardSuccess', () => {
			test( 'should dispatch a success notice and an add email forward success action on a good response', () => {
				const resultActions = addEmailForwardSuccess( action, { created: true, verified: true } );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isSuccessNotice( resultActions[ 0 ] ) ).to.be.true;
				expect(
					noticeHasText( resultActions[ 0 ], 'test@example.com has been successfully added!' )
				).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
					domainName,
					mailbox,
					verified: true,
				} );
			} );

			test( 'should dispatch a success notice with verify and an add email forward success action on a response without verification', () => {
				const resultActions = addEmailForwardSuccess( action, {
					created: true,
					verified: false,
				} );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isSuccessNotice( resultActions[ 0 ] ) ).to.be.true;
				expect(
					noticeHasText(
						resultActions[ 0 ],
						'test@example.com has been successfully added! ' +
							'You must confirm your email before it starts working. ' +
							'Please check your inbox for 123@abc.com.'
					)
				).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
					domainName,
					mailbox,
					verified: false,
				} );
			} );

			test( 'should dispatch a error notice and an add email forward failure action on a response with created: false', () => {
				const resultActions = addEmailForwardSuccess( action, { created: false, verified: false } );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
					domainName,
					mailbox,
					destination,
					error: true,
				} );
			} );

			test( 'should dispatch a error notice and an add email forward failure action on no response', () => {
				const resultActions = addEmailForwardSuccess( action, undefined );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
					domainName,
					mailbox,
					destination,
					error: true,
				} );
			} );
		} );
	} );
} );
