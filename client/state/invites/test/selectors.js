/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingInvitesForSite, getInvitesForSite, isRequestingResend } from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingInvitesForSite()', () => {
		test( 'should return true when requesting invites', () => {
			const state = {
				invites: {
					requesting: {
						12345: false,
						67890: true,
					},
				},
			};
			expect( isRequestingInvitesForSite( state, 67890 ) ).to.equal( true );
		} );

		test( 'should return false when request is complete', () => {
			const state = {
				invites: {
					requesting: {
						12345: false,
						67890: true,
					},
				},
			};
			expect( isRequestingInvitesForSite( state, 12345 ) ).to.equal( false );
		} );

		test( 'should return false when invites have not been requested', () => {
			const state = {
				invites: {
					requesting: {},
				},
			};
			expect( isRequestingInvitesForSite( state, 12345 ) ).to.equal( false );
		} );
	} );

	describe( '#getInvitesForSite()', () => {
		test( 'should return invites when invites exist for site', () => {
			const state = {
				invites: {
					items: {
						12345: [
							{
								key: '123456asdf789',
								role: 'follower',
								isPending: null,
								user: {
									login: 'chicken',
									email: false,
									name: 'Pollo',
									avatar_URL:
										'https://2.gravatar.com/avatar/eba3ff8480f481053bbd52b2a08c6136?s=96&d=identicon&r=G',
								},
							},
						],
					},
				},
			};
			expect( getInvitesForSite( state, 12345 ) ).to.eql( state.invites.items[ 12345 ] );
		} );

		test( 'should return null when invites do not exist for site', () => {
			const state = {
				invites: {
					items: {},
				},
			};
			expect( getInvitesForSite( state, 12345 ) ).to.equal( null );
		} );
	} );

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
