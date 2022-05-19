import {
	EMAIL_FORWARDING_REMOVE_REQUEST,
	EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { removeEmailForward, removeEmailForwardSuccess, removeEmailForwardFailure } from '../';
import { isSuccessNotice, isErrorNotice, noticeHasText } from '../../test-utils';

describe( 'wpcom-api', () => {
	describe( 'email forwarding remove forward request', () => {
		const domainName = 'example.com';
		const mailbox = 'test';
		const action = {
			type: EMAIL_FORWARDING_REMOVE_REQUEST,
			domainName,
			mailbox,
		};

		describe( '#removeEmailForward', () => {
			test( 'should dispatch an HTTP request to the email forward delete endpoint', () => {
				expect( removeEmailForward( action ) ).toEqual(
					http(
						{
							method: 'POST',
							path: '/domains/example.com/email/test/delete',
							body: {},
						},
						action
					)
				);
			} );
		} );

		describe( '#removeEmailForwardFailure', () => {
			const message = 'An error has occured';

			test( 'should dispatch a error notice and a remove email forward failure action on error', () => {
				const resultActions = removeEmailForwardFailure( action, { message } );
				expect( resultActions ).toHaveLength( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).toBe( true );
				expect( resultActions[ 1 ] ).toEqual( {
					type: EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
					domainName,
					mailbox,
					error: { message },
				} );
			} );
		} );

		describe( '#removeEmailForwardSuccess', () => {
			test( 'should dispatch a success notice and a remove email forward success action on a good response', () => {
				const resultActions = removeEmailForwardSuccess( action, { deleted: true } );
				expect( resultActions ).toHaveLength( 2 );
				expect( isSuccessNotice( resultActions[ 0 ] ) ).toBe( true );
				expect(
					noticeHasText(
						resultActions[ 0 ],
						'Email forward test@example.com has been successfully removed.'
					)
				).toBe( true );
				expect( resultActions[ 1 ] ).toEqual( {
					type: EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS,
					domainName,
					mailbox,
				} );
			} );

			test( 'should dispatch a error notice and a remove email forward failure action on response with deleted: false', () => {
				const resultActions = removeEmailForwardSuccess( action, { deleted: false } );
				expect( resultActions ).toHaveLength( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).toBe( true );
				expect( resultActions[ 1 ] ).toEqual( {
					type: EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
					domainName,
					mailbox,
					error: true,
				} );
			} );

			test( 'should dispatch a error notice and a remove email forward failure action on no response', () => {
				const resultActions = removeEmailForwardSuccess( action, undefined );
				expect( resultActions ).toHaveLength( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).toBe( true );
				expect( resultActions[ 1 ] ).toEqual( {
					type: EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
					domainName,
					mailbox,
					error: true,
				} );
			} );
		} );
	} );
} );
