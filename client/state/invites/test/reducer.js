/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

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
		test( 'should accumulate invites', () => {
			const original = deepFreeze( { 12345: { '123456asdf789': false } } );
			const state = requestingResend( original, {
				type: INVITE_RESEND_REQUEST,
				siteId: 12345,
				inviteId: '789lkjh123456',
			} );
			expect( state ).to.eql( {
				12345: { '123456asdf789': false, '789lkjh123456': true },
			} );
		} );
		test( 'should accumulate sites', () => {
			const original = deepFreeze( { 12345: { '123456asdf789': false } } );
			const state = requestingResend( original, {
				type: INVITE_RESEND_REQUEST,
				siteId: 67890,
				inviteId: '789lkjh123456',
			} );
			expect( state ).to.eql( {
				12345: { '123456asdf789': false },
				67890: { '789lkjh123456': true },
			} );
		} );
	} );
} );
