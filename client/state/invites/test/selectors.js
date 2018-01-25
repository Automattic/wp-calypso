/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingResend } from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingResend()', () => {
		test( 'should return true when requesting resend', () => {
			const state = {
				invites: {
					requestingResend: {
						12345: { '123456asdf789': false },
						67890: { '789lkjh123456': true },
					},
				},
			};
			expect( isRequestingResend( state, 67890, '789lkjh123456' ) ).to.equal( true );
		} );

		test( 'should return false when resend request is complete', () => {
			const state = {
				invites: {
					requestingResend: {
						12345: { '123456asdf789': false },
						67890: { '789lkjh123456': true },
					},
				},
			};
			expect( isRequestingResend( state, 12345, '123456asdf789' ) ).to.equal( false );
		} );

		test( 'should return false when resend has not been requested', () => {
			const state = {
				invites: {
					requestingResend: {},
				},
			};
			expect( isRequestingResend( state, 12345, '9876asdf54321' ) ).to.equal( false );
		} );
	} );
} );
