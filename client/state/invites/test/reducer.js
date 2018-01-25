/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { requestingResend } from '../reducer';
import { INVITE_RESEND_REQUEST } from 'state/action-types';

describe( 'reducer', () => {
	describe( '#resendRequests()', () => {
		test( 'should key requests by site ID and invite ID', () => {
			const state = requestingResend(
				{},
				{
					type: INVITE_RESEND_REQUEST,
					siteId: 12345,
					inviteId: '123456asdf789',
				}
			);
			expect( state ).to.eql( {
				12345: { '123456asdf789': true },
			} );
		} );
	} );
} );
