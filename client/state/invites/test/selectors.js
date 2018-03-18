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
	getPendingInvitesForSite,
	getAcceptedInvitesForSite,
	isRequestingInviteResend,
	getNumberOfInvitesFoundForSite,
	didInviteResendSucceed,
	getInviteForSite,
	isDeletingInvite,
	didInviteDeletionSucceed,
	isDeletingAnyInvite,
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

	describe( '#getPendingInvitesForSite()', () => {
		test( 'should return invites when pending invites exist for site', () => {
			const state = {
				invites: {
					items: {
						12345: {
							pending: [
								{
									key: '123456asdf789',
									role: 'follower',
									isPending: true,
									inviteDate: '2018-01-28T17:22:16+00:00',
									acceptedDate: null,
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
							accepted: [],
						},
					},
				},
			};
			expect( getPendingInvitesForSite( state, 12345 ) ).to.eql(
				state.invites.items[ 12345 ].pending
			);
		} );

		test( 'should return an empty array if no pending invites for site', () => {
			const state = {
				invites: {
					items: {
						12345: {
							pending: [],
							accepted: [
								{
									key: 'jkl789asd12345',
									role: 'subscriber',
									isPending: false,
									user: {
										login: 'grilledchicken',
										email: false,
										name: 'Pollo Asado',
										avatar_URL:
											'https://2.gravatar.com/avatar/eba3ff8480f481053bbd52b2a08c6136?s=96&d=identicon&r=G',
									},
								},
							],
						},
					},
				},
			};
			expect( getPendingInvitesForSite( state, 12345 ) ).to.eql( [] );
		} );

		test( 'should return null if no invites for site', () => {
			const state = {
				invites: {
					items: {},
				},
			};
			expect( getPendingInvitesForSite( state, 12345 ) ).to.equal( null );
		} );
	} );

	describe( '#getAcceptedInvitesForSite()', () => {
		test( 'should return invites when accepted invites exist for site', () => {
			const state = {
				invites: {
					items: {
						12345: {
							pending: [],
							accepted: [
								{
									key: 'jkl789asd12345',
									role: 'subscriber',
									isPending: false,
									user: {
										login: 'grilledchicken',
										email: false,
										name: 'Pollo Asado',
										avatar_URL:
											'https://2.gravatar.com/avatar/eba3ff8480f481053bbd52b2a08c6136?s=96&d=identicon&r=G',
									},
								},
							],
						},
					},
				},
			};
			expect( getAcceptedInvitesForSite( state, 12345 ) ).to.eql(
				state.invites.items[ 12345 ].accepted
			);
		} );

		test( 'should return an empty array if no accepted invites for site', () => {
			const state = {
				invites: {
					items: {
						12345: {
							pending: [
								{
									key: '123456asdf789',
									role: 'follower',
									isPending: true,
									user: {
										login: 'chicken',
										email: false,
										name: 'Pollo',
										avatar_URL:
											'https://2.gravatar.com/avatar/eba3ff8480f481053bbd52b2a08c6136?s=96&d=identicon&r=G',
									},
								},
							],
							accepted: [],
						},
					},
				},
			};
			expect( getAcceptedInvitesForSite( state, 12345 ) ).to.eql( [] );
		} );

		test( 'should return null if no invites for site', () => {
			const state = {
				invites: {
					items: {},
				},
			};
			expect( getAcceptedInvitesForSite( state, 12345 ) ).to.equal( null );
		} );
	} );

	describe( '#getInviteForSite()', () => {
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
						12345: {
							pending: [
								{
									key: '123456asdf789',
									role: 'follower',
									isPending: true,
									inviteDate: '2018-01-28T17:22:16+00:00',
									acceptedDate: null,
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
							accepted: [],
						},
					},
				},
			};
			expect( getInviteForSite( state, 12345, '123456asdf789' ) ).to.equal(
				state.invites.items[ 12345 ].pending[ 0 ]
			);
		} );

		test( 'should memoize return values given the same input', () => {
			const state = {
				invites: {
					items: {
						12345: {
							pending: [],
							accepted: [
								{
									key: '123456asdf789',
									role: 'follower',
									isPending: false,
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
				},
			};

			expect( lodash.find.callCount ).to.equal( 0 );

			const call1 = getInviteForSite( state, 12345, '123456asdf789' );
			expect( lodash.find.callCount ).to.equal( 2 );
			expect( call1 ).to.equal( state.invites.items[ 12345 ].accepted[ 0 ] );

			const call2 = getInviteForSite( state, 12345, '123456asdf789' );
			expect( lodash.find.callCount ).to.equal( 2 );
			expect( call1 ).to.equal( call2 );

			const newState = lodash.cloneDeep( state );
			const call3 = getInviteForSite( newState, 12345, '123456asdf789' );
			expect( lodash.find.callCount ).to.equal( 4 );
			expect( call3 ).to.equal( newState.invites.items[ 12345 ].accepted[ 0 ] );
			expect( call3 ).not.to.equal( call2 );
		} );

		test( 'should return null when invites do not exist for site', () => {
			const state = {
				invites: {
					items: {},
				},
			};
			expect( getInviteForSite( state, 12345, '123456asdf789' ) ).to.equal( null );
		} );

		test( 'should return null if the given invite key is not valid for site', () => {
			const state = {
				invites: {
					items: {
						12345: {
							pending: [
								{
									key: '123456asdf789',
									role: 'follower',
									isPending: true,
									inviteDate: '2018-01-28T17:22:16+00:00',
									acceptedDate: null,
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
							accepted: [],
						},
					},
				},
			};
			expect( getInviteForSite( state, 12345, '123456asdf000' ) ).to.equal( null );
		} );
	} );

	describe( '#isRequestingInviteResend()', () => {
		test( 'should return true when requesting resend', () => {
			const state = {
				invites: {
					requestingResend: {
						12345: { '123456asdf789': 'success' },
						67890: { '789lkjh123456': 'requesting' },
					},
				},
			};
			expect( isRequestingInviteResend( state, 67890, '789lkjh123456' ) ).to.equal( true );
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
			expect( isRequestingInviteResend( state, 12345, '123456asdf789' ) ).to.equal( false );
		} );

		test( 'should return false when resend has not been requested', () => {
			const state = {
				invites: {
					requestingResend: {},
				},
			};
			expect( isRequestingInviteResend( state, 12345, '9876asdf54321' ) ).to.equal( false );
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

	describe( '#didInviteResendSucceed()', () => {
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
			expect( didInviteResendSucceed( state, 12345, '123456asdf789' ) ).to.equal( true );
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
			expect( didInviteResendSucceed( state, 67890, '789lkjh123456' ) ).to.equal( false );
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
			expect( didInviteResendSucceed( state, 34567, 'asdf987654321' ) ).to.equal( false );
		} );

		test( 'should return false when resend has not been requested', () => {
			const state = {
				invites: {
					requestingResend: {},
				},
			};
			expect( didInviteResendSucceed( state, 12345, '9876asdf54321' ) ).to.equal( false );
		} );
	} );

	describe( '#didInviteDeletionSucceed()', () => {
		test( 'should return true for successful deletion', () => {
			const state = {
				invites: {
					deleting: {
						12345: { '123456asdf789': 'success' },
					},
				},
			};
			expect( didInviteDeletionSucceed( state, 12345, '123456asdf789' ) ).to.equal( true );
		} );

		test( 'should return false when a deletion is pending', () => {
			const state = {
				invites: {
					deleting: {
						67890: { '789lkjh123456': 'requesting' },
					},
				},
			};
			expect( didInviteDeletionSucceed( state, 67890, '789lkjh123456' ) ).to.equal( false );
		} );

		test( 'should return false when a deletion is failure', () => {
			const state = {
				invites: {
					deleting: {
						34567: { asdf987654321: 'failure' },
					},
				},
			};
			expect( didInviteDeletionSucceed( state, 34567, 'asdf987654321' ) ).to.equal( false );
		} );

		test( 'should return false when deletion has not been requested', () => {
			const state = {
				invites: {
					deleting: {},
				},
			};
			expect( didInviteDeletionSucceed( state, 12345, '9876asdf54321' ) ).to.equal( false );
		} );
	} );

	describe( '#isDeletingInvite()', () => {
		test( 'should return true when requesting deletion', () => {
			const state = {
				invites: {
					deleting: {
						67890: { '789lkjh123456': 'requesting' },
					},
				},
			};
			expect( isDeletingInvite( state, 67890, '789lkjh123456' ) ).to.equal( true );
		} );

		test( 'should return false when deletion request is complete', () => {
			const state = {
				invites: {
					deleting: {
						12345: { '123456asdf789': 'success' },
					},
				},
			};
			expect( isDeletingInvite( state, 12345, '123456asdf789' ) ).to.equal( false );
		} );

		test( 'should return false when deletion has not been requested', () => {
			const state = {
				invites: {
					deleting: {},
				},
			};
			expect( isDeletingInvite( state, 12345, '9876asdf54321' ) ).to.equal( false );
		} );
	} );

	describe( '#isDeletingAnyInvite()', () => {
		test( 'should return true when requesting deletion for any invite on the site', () => {
			const state = {
				invites: {
					deleting: {
						12345: {
							'123456asdf789': 'requesting',
							'9876asdf54321': 'success',
						},
					},
				},
			};
			expect( isDeletingAnyInvite( state, 12345 ) ).to.equal( true );
		} );

		test( 'should return false when all deletion requests are complete', () => {
			const state = {
				invites: {
					deleting: {
						12345: {
							'123456asdf789': 'success',
							'9876asdf54321': 'success',
						},
					},
				},
			};
			expect( isDeletingAnyInvite( state, 12345 ) ).to.equal( false );
		} );

		test( 'should return false when deletion has not been requested', () => {
			const state = {
				invites: {
					deleting: {},
				},
			};
			expect( isDeletingAnyInvite( state, 12345 ) ).to.equal( false );
		} );
	} );
} );
