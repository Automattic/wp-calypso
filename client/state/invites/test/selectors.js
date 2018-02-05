/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import lodash from 'lodash';

/**
 * Internal dependencies
 */
import {
	isRequestingInvitesForSite,
	getInvitesForSite,
	isRequestingResend,
	getNumberOfInvitesFoundForSite,
	didResendSucceed,
	getSelectedInvite,
} from '../selectors';

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
								inviteDate: '2018-01-28T17:22:16+00:00',
								acceptedDate: '2018-01-28T17:22:20+00:00',
								user: {
									login: 'chicken',
									email: false,
									name: 'Pollo',
									avatar_URL:
										'https://2.gravatar.com/avatar/eba3ff8480f481053bbd52b2a08c6136?s=96&d=identicon&r=G',
								},
								invitedBy: {
									login: 'cow',
									name: 'Vaca',
									avatar_URL:
										'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
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

	describe( '#getSelectedInvite()', () => {
		beforeAll( () => {
			sinon.spy( lodash, 'find' );
		} );

		afterEach( () => {
			lodash.find.reset();
		} );

		test( 'should return invite', () => {
			const state = {
				invites: {
					items: {
						12345: [
							{
								key: '123456asdf789',
								role: 'follower',
								isPending: null,
								inviteDate: '2018-01-28T17:22:16+00:00',
								acceptedDate: '2018-01-28T17:22:20+00:00',
								user: {
									login: 'chicken',
									email: false,
									name: 'Pollo',
									avatar_URL:
										'https://2.gravatar.com/avatar/eba3ff8480f481053bbd52b2a08c6136?s=96&d=identicon&r=G',
								},
								invitedBy: {
									login: 'cow',
									name: 'Vaca',
									avatar_URL:
										'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
								},
							},
						],
					},
				},
			};
			expect( getSelectedInvite( state, 12345, '123456asdf789' ) ).to.eql(
				state.invites.items[ 12345 ][ 0 ]
			);
		} );

		test( 'should memoize return values given the same input', () => {
			const state = {
				invites: {
					items: {
						12345: [
							{
								key: '123456asdf789',
								role: 'follower',
								isPending: null,
								inviteDate: '2018-01-28T17:22:16+00:00',
								acceptedDate: '2018-01-28T17:22:20+00:00',
								user: {
									login: 'chicken',
									email: false,
									name: 'Pollo',
									avatar_URL:
										'https://2.gravatar.com/avatar/eba3ff8480f481053bbd52b2a08c6136?s=96&d=identicon&r=G',
								},
								invitedBy: {
									login: 'cow',
									name: 'Vaca',
									avatar_URL:
										'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
								},
							},
						],
					},
				},
			};
			expect( lodash.find.callCount ).to.equal( 0 );
			const call1 = getSelectedInvite( state, 12345, '123456asdf789' );
			expect( lodash.find.callCount ).to.equal( 1 );
			const call2 = getSelectedInvite( state, 12345, '123456asdf789' );
			expect( lodash.find.callCount ).to.equal( 1 );
			expect( call1 ).to.equal( call2 );
			const newState = lodash.cloneDeep( state );
			const call3 = getSelectedInvite( newState, 12345, '123456asdf789' );
			expect( lodash.find.callCount ).to.equal( 2 );
			expect( call3 ).not.to.equal( call2 );
		} );

		test( 'should return undefined when invites do not exist for site', () => {
			const state = {
				invites: {
					items: {},
				},
			};
			expect( getSelectedInvite( state, 12345, '123456asdf789' ) ).to.equal( undefined );
		} );
	} );

	describe( '#isRequestingResend()', () => {
		test( 'should return true when requesting resend', () => {
			const state = {
				invites: {
					requestingResend: {
						12345: { '123456asdf789': 'success' },
						67890: { '789lkjh123456': 'requesting' },
					},
				},
			};
			expect( isRequestingResend( state, 67890, '789lkjh123456' ) ).to.equal( true );
		} );

		test( 'should return false when resend request is complete', () => {
			const state = {
				invites: {
					requestingResend: {
						12345: { '123456asdf789': 'success' },
						67890: { '789lkjh123456': 'requesting' },
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

	describe( '#getNumberOfInvitesFoundForSite()', () => {
		test( 'should return null when count is unknown', () => {
			const state = {
				invites: {
					counts: {},
				},
			};
			expect( getNumberOfInvitesFoundForSite( state, 12345 ) ).to.equal( null );
		} );

		test( 'should return the number found when count is known', () => {
			const state = {
				invites: {
					counts: {
						12345: 678,
					},
				},
			};
			expect( getNumberOfInvitesFoundForSite( state, 12345 ) ).to.equal( 678 );
		} );
	} );

	describe( '#didResendSucceed()', () => {
		test( 'should return true for successful resends', () => {
			const state = {
				invites: {
					requestingResend: {
						12345: { '123456asdf789': 'success' },
						67890: { '789lkjh123456': 'requesting' },
						34567: { asdf987654321: 'failure' },
					},
				},
			};
			expect( didResendSucceed( state, 12345, '123456asdf789' ) ).to.equal( true );
		} );

		test( 'should return false when a resend is pending', () => {
			const state = {
				invites: {
					requestingResend: {
						12345: { '123456asdf789': 'success' },
						67890: { '789lkjh123456': 'requesting' },
						34567: { asdf987654321: 'failure' },
					},
				},
			};
			expect( didResendSucceed( state, 67890, '789lkjh123456' ) ).to.equal( false );
		} );

		test( 'should return false when a resend is failure', () => {
			const state = {
				invites: {
					requestingResend: {
						12345: { '123456asdf789': 'success' },
						67890: { '789lkjh123456': 'requesting' },
						34567: { asdf987654321: 'failure' },
					},
				},
			};
			expect( didResendSucceed( state, 34567, 'asdf987654321' ) ).to.equal( false );
		} );

		test( 'should return false when resend has not been requested', () => {
			const state = {
				invites: {
					requestingResend: {},
				},
			};
			expect( didResendSucceed( state, 12345, '9876asdf54321' ) ).to.equal( false );
		} );
	} );
} );
