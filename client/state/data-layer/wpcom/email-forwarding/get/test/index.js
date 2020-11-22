/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getEmailForwards, getEmailForwardsFailure, getEmailForwardsSuccess } from '../';
import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { isErrorNotice } from '../../test-utils';

import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'email forwarding get forwards request', () => {
		const domainName = 'example.com';
		const action = {
			type: EMAIL_FORWARDING_REQUEST,
			domainName,
		};

		describe( '#getEmailForwards', () => {
			test( 'should dispatch an HTTP request to the get email forwards endpoint', () => {
				expect( getEmailForwards( action ) ).to.eql(
					http(
						{
							method: 'GET',
							path: '/domains/example.com/email',
						},
						action
					)
				);
			} );
		} );

		describe( '#getEmailForwardsFailure', () => {
			const message = 'An error has occured';

			test( 'should dispatch a get email forwards failure action on error', () => {
				const resultActions = getEmailForwardsFailure( action, { message } );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_REQUEST_FAILURE,
					domainName,
					error: { message },
				} );
			} );
		} );

		describe( '#getEmailForwardsSuccess', () => {
			test( 'should dispatch a get email forwards success action and response on correct "forward" type response', () => {
				const response = {
					forwards: [
						{
							email: 'test@example.com',
							mailbox: 'test',
							domain: 'example.com',
							forward_address: 'test@forward.com',
							active: true,
							created: 1551136603,
						},
					],
					type: 'forward',
				};
				expect( getEmailForwardsSuccess( action, response ) ).to.eql( {
					type: EMAIL_FORWARDING_REQUEST_SUCCESS,
					domainName,
					response,
				} );
			} );

			test( 'should dispatch a get email forwards success action and response on correct "custom" type response', () => {
				const response = {
					mx_servers: [
						{
							server: 'mx.test.com.',
							priority: '10',
						},
					],
					type: 'custom',
				};
				expect( getEmailForwardsSuccess( action, response ) ).to.eql( {
					type: EMAIL_FORWARDING_REQUEST_SUCCESS,
					domainName,
					response,
				} );
			} );

			test( 'should dispatch a get email forwards success action and response on correct "google-apps" type response', () => {
				const response = {
					type: 'google-apps',
				};
				expect( getEmailForwardsSuccess( action, response ) ).to.eql( {
					type: EMAIL_FORWARDING_REQUEST_SUCCESS,
					domainName,
					response,
				} );
			} );

			test( 'should dispatch a get email forwards success action and response on correct "google-apps-another-provider" type response', () => {
				const response = {
					type: 'google-apps-another-provider',
				};
				expect( getEmailForwardsSuccess( action, response ) ).to.eql( {
					type: EMAIL_FORWARDING_REQUEST_SUCCESS,
					domainName,
					response,
				} );
			} );

			test( 'should dispatch a get email forwards failure action on no response', () => {
				const resultActions = getEmailForwardsSuccess( action, undefined );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_REQUEST_FAILURE,
					domainName,
					error: { message: 'No `type` in get forwards response.' },
				} );
			} );

			test( 'should dispatch a get email forwards failure action on response with no type', () => {
				const resultActions = getEmailForwardsSuccess( action, {} );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_REQUEST_FAILURE,
					domainName,
					error: { message: 'No `type` in get forwards response.' },
				} );
			} );

			test( 'should dispatch a get email forwards failure action on incorrect "forward" type response', () => {
				const response = {
					type: 'forward',
				};

				const resultActions = getEmailForwardsSuccess( action, response );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_REQUEST_FAILURE,
					domainName,
					error: { message: 'No forwards in `forward` type response' },
				} );
			} );

			test( 'should dispatch a get email forwards failure action on incorrect "custom" type response', () => {
				const response = {
					type: 'custom',
				};

				const resultActions = getEmailForwardsSuccess( action, response );
				expect( resultActions ).to.have.lengthOf( 2 );
				expect( isErrorNotice( resultActions[ 0 ] ) ).to.be.true;
				expect( resultActions[ 1 ] ).to.eql( {
					type: EMAIL_FORWARDING_REQUEST_FAILURE,
					domainName,
					error: {
						message: 'No mx_servers in `custom` type response',
					},
				} );
			} );
		} );
	} );
} );
