/** @format */
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
} from 'state/action-types';

import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'email forwarding add forward request', () => {
		const domainName = 'example.com',
			mailbox = 'test',
			destination = '123@abc.com',
			action = {
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

		describe( '#addEmailForwardSuccess', () => {
			test( 'should dispatch a success notice and add email forward success action on a good response', () => {
				const resultActions = addEmailForwardSuccess( action, { created: true, verified: true } );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( resultActions[ 0 ] ).to.have.nested.property( 'notice.status', 'is-success' );
				expect( resultActions[ 0 ] ).to.have.nested.property(
					'notice.text',
					'test@example.com has been successfully added!'
				);
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
					domainName,
					mailbox,
					verified: true,
				} );
			} );

			test( 'should dispatch a success notice with verify and add email forward success action on a response without verification', () => {
				const resultActions = addEmailForwardSuccess( action, {
					created: true,
					verified: false,
				} );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( resultActions[ 0 ] ).to.have.nested.property( 'notice.status', 'is-success' );
				expect( resultActions[ 0 ] ).to.have.nested.property(
					'notice.text',
					'test@example.com has been successfully added! ' +
						'You must confirm your email before it starts working. ' +
						'Please check your inbox for 123@abc.com.'
				);
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
					domainName,
					mailbox,
					verified: false,
				} );
			} );

			test( 'should dispatch a error notice and failure event on no response', () => {
				const resultActions = addEmailForwardSuccess( action, undefined );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( resultActions[ 0 ] ).to.have.nested.property( 'notice.status', 'is-error' );
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
					domainName,
					mailbox,
					destination,
					error: true,
				} );
			} );
		} );

		describe( '#addEmailForwardFailure', () => {
			const message = 'An error has occured';

			test( 'should dispatch a error notice and failure event on error', () => {
				const resultActions = addEmailForwardFailure( action, { message } );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( resultActions[ 0 ] ).to.have.nested.property( 'notice.status', 'is-error' );
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
					domainName,
					mailbox,
					destination,
					error: { message },
				} );
			} );
		} );
	} );
} );
