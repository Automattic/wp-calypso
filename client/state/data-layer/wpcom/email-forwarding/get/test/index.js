/** @format */
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
} from 'state/action-types';

import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'email forwarding get forwards request', () => {
		const domainName = 'example.com',
			action = {
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
				expect( getEmailForwardsFailure( action, { message } ) ).to.eql( {
					type: EMAIL_FORWARDING_REQUEST_FAILURE,
					domainName,
					error: { message },
				} );
			} );
		} );

		describe( '#getEmailForwardsSuccess', () => {
			test( 'should dispatch a get email forwards success action and list of forwards on success', () => {
				const forwards = [
					{
						email: 'test@example.com',
						mailbox: 'test',
						domain: 'example.com',
						forward_address: 'test@forward.com',
						active: true,
						created: 1551136603,
					},
				];
				expect( getEmailForwardsSuccess( action, { forwards } ) ).to.eql( {
					type: EMAIL_FORWARDING_REQUEST_SUCCESS,
					domainName,
					forwards,
				} );
			} );

			test( 'should dispatch a get email forwards failure action on no response', () => {
				expect( getEmailForwardsSuccess( action, undefined ) ).to.eql( {
					type: EMAIL_FORWARDING_REQUEST_FAILURE,
					domainName,
					error: true,
				} );
			} );
		} );
	} );
} );
