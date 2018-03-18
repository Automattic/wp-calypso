/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { requesting, items, counts, requestingResend, deleting } from '../reducer';
import {
	INVITES_REQUEST,
	INVITES_REQUEST_SUCCESS,
	INVITE_RESEND_REQUEST,
	INVITE_RESEND_REQUEST_SUCCESS,
	INVITE_RESEND_REQUEST_FAILURE,
	INVITES_DELETE_REQUEST,
	INVITES_DELETE_REQUEST_FAILURE,
	INVITES_DELETE_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	describe( '#requesting()', () => {
		test( 'should key requests by site ID', () => {
			const state = requesting(
				{},
				{
					type: INVITES_REQUEST,
					siteId: 12345,
				}
			);
			expect( state ).to.eql( {
				12345: true,
			} );
		} );

		test( 'should accumulate sites', () => {
			const original = deepFreeze( { 12345: false } );
			const state = requesting( original, {
				type: INVITES_REQUEST,
				siteId: 67890,
			} );
			expect( state ).to.eql( {
				12345: false,
				67890: true,
			} );
		} );
	} );

	describe( '#items()', () => {
		test( 'should key invites by site ID and pending/accepted status', () => {
			const state = items(
				{},
				{
					type: INVITES_REQUEST_SUCCESS,
					siteId: 12345,
					invites: [
						{
							invite_key: '123456asdf789',
							role: 'follower',
							is_pending: true,
							invite_date: '2018-01-28T17:22:16+00:00',
							accepted_date: null,
							user: {
								login: 'chicken',
								email: false,
								name: 'Pollo',
								avatar_URL:
									'https://2.gravatar.com/avatar/eba3ff8480f481053bbd52b2a08c6136?s=96&d=identicon&r=G',
							},
							invited_by: {
								login: 'cow',
								name: 'Vaca',
								avatar_URL:
									'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
							},
						},
						{
							invite_key: 'jkl789asd12345',
							role: 'subscriber',
							is_pending: false,
							invite_date: '2018-01-28T17:22:16+00:00',
							accepted_date: '2018-01-28T17:22:20+00:00',
							user: {
								login: 'grilledchicken',
								email: false,
								name: 'Pollo Asado',
								avatar_URL:
									'https://2.gravatar.com/avatar/eba3ff8480f481053bbd52b2a08c6136?s=96&d=identicon&r=G',
							},
							invited_by: {
								login: 'cow',
								name: 'Vaca',
								avatar_URL:
									'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
							},
						},
					],
				}
			);
			expect( state ).to.eql( {
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
					accepted: [
						{
							key: 'jkl789asd12345',
							role: 'subscriber',
							isPending: false,
							inviteDate: '2018-01-28T17:22:16+00:00',
							acceptedDate: '2018-01-28T17:22:20+00:00',
							user: {
								login: 'grilledchicken',
								email: false,
								name: 'Pollo Asado',
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
			} );
		} );

		test( 'should accumulate sites', () => {
			const original = {
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
			};
			const state = items( original, {
				type: INVITES_REQUEST_SUCCESS,
				siteId: 67890,
				invites: [
					{
						invite_key: '9876fdas54321',
						role: 'follower',
						is_pending: true,
						invite_date: '2018-01-28T17:22:16+00:00',
						accepted_date: null,
						user: {
							login: 'celery',
							email: false,
							name: 'Apio',
							avatar_URL:
								'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
						},
						invited_by: {
							login: 'cow',
							name: 'Vaca',
							avatar_URL:
								'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
						},
					},
				],
			} );
			expect( state ).to.eql( {
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
				67890: {
					pending: [
						{
							key: '9876fdas54321',
							role: 'follower',
							isPending: true,
							inviteDate: '2018-01-28T17:22:16+00:00',
							acceptedDate: null,
							user: {
								login: 'celery',
								email: false,
								name: 'Apio',
								avatar_URL:
									'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
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
			} );
		} );

		test( 'should delete invite', () => {
			const original = {
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
			};
			const state = items( original, {
				type: INVITES_DELETE_REQUEST_SUCCESS,
				siteId: 12345,
				inviteIds: [ '123456asdf789' ],
			} );
			expect( state ).to.eql( {
				12345: {
					pending: [],
					accepted: [],
				},
			} );
		} );

		test( 'should delete invites', () => {
			const original = {
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
					accepted: [
						{
							key: '9876fdas54321',
							role: 'follower',
							isPending: true,
							inviteDate: '2018-01-28T17:22:16+00:00',
							acceptedDate: null,
							user: {
								login: 'celery',
								email: false,
								name: 'Apio',
								avatar_URL:
									'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
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
			};
			const state = items( original, {
				type: INVITES_DELETE_REQUEST_SUCCESS,
				siteId: 12345,
				inviteIds: [ '123456asdf789', '9876fdas54321' ],
			} );
			expect( state ).to.eql( {
				12345: {
					pending: [],
					accepted: [],
				},
			} );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
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
					accepted: [
						{
							key: 'jkl789asd12345',
							role: 'subscriber',
							isPending: false,
							inviteDate: '2018-01-28T17:22:16+00:00',
							acceptedDate: '2018-01-28T17:22:20+00:00',
							user: {
								login: 'grilledchicken',
								email: false,
								name: 'Pollo Asado',
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
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
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
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		describe( 'invalid state tests', () => {
			useSandbox( sandbox => {
				sandbox.stub( console, 'warn' );
			} );

			test( 'should not load invalid persisted state (1)', () => {
				const original = deepFreeze( {
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
								hasExtraInvalidProperty: true,
							},
						],
						accepted: [],
					},
				} );
				const state = items( original, { type: DESERIALIZE } );

				expect( state ).to.eql( {} );
			} );

			test( 'should not load invalid persisted state (2)', () => {
				const original = deepFreeze( {
					12345: {
						pending: [],
						accepted: [
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
				} );
				const state = items( original, { type: DESERIALIZE } );

				expect( state ).to.eql( {} );
			} );

			test( 'should not load invalid persisted state (3)', () => {
				const original = deepFreeze( {
					12345: { pending: [] /* accepted: missing */ },
				} );
				const state = items( original, { type: DESERIALIZE } );

				expect( state ).to.eql( {} );
			} );

			test( 'should not load invalid persisted state (4)', () => {
				const original = deepFreeze( {
					12345: { pending: [], accepted: [], fileNotFound: [] },
				} );
				const state = items( original, { type: DESERIALIZE } );

				expect( state ).to.eql( {} );
			} );
		} );
	} );

	describe( '#counts()', () => {
		test( 'should key requests by site ID', () => {
			const state = counts(
				{},
				{
					type: INVITES_REQUEST_SUCCESS,
					siteId: 12345,
					found: 678,
				}
			);
			expect( state ).to.eql( {
				12345: 678,
			} );
		} );

		test( 'should accumulate sites', () => {
			const original = deepFreeze( { 12345: 678 } );
			const state = counts( original, {
				type: INVITES_REQUEST_SUCCESS,
				siteId: 67890,
				found: 12,
			} );
			expect( state ).to.eql( {
				12345: 678,
				67890: 12,
			} );
		} );

		test( 'should reduce after successful deletes', () => {
			const original = deepFreeze( { 12345: 678, 67890: 12 } );
			const state = counts( original, {
				type: INVITES_DELETE_REQUEST_SUCCESS,
				siteId: 67890,
				inviteIds: [ '123456asdf789', '789lkjh123456' ],
			} );
			expect( state ).to.eql( {
				12345: 678,
				67890: 10,
			} );
		} );
	} );

	describe( '#requestingResend()', () => {
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
				12345: { '123456asdf789': 'requesting' },
			} );
		} );

		test( 'should use value success for successful resends', () => {
			const state = requestingResend(
				{},
				{
					type: INVITE_RESEND_REQUEST_SUCCESS,
					siteId: 12345,
					inviteId: '123456asdf789',
				}
			);
			expect( state ).to.eql( {
				12345: { '123456asdf789': 'success' },
			} );
		} );

		test( 'should use value failure for failed resends', () => {
			const state = requestingResend(
				{},
				{
					type: INVITE_RESEND_REQUEST_FAILURE,
					siteId: 12345,
					inviteId: '123456asdf789',
				}
			);
			expect( state ).to.eql( {
				12345: { '123456asdf789': 'failure' },
			} );
		} );

		test( 'should accumulate invites', () => {
			const original = deepFreeze( { 12345: { '123456asdf789': 'success' } } );
			const state1 = requestingResend( original, {
				type: INVITE_RESEND_REQUEST,
				siteId: 12345,
				inviteId: '123_requesting',
			} );
			expect( state1 ).to.eql( {
				12345: { '123456asdf789': 'success', '123_requesting': 'requesting' },
			} );
			const state2 = requestingResend( state1, {
				type: INVITE_RESEND_REQUEST_SUCCESS,
				siteId: 12345,
				inviteId: '456_success',
			} );
			expect( state2 ).to.eql( {
				12345: {
					'123456asdf789': 'success',
					'123_requesting': 'requesting',
					'456_success': 'success',
				},
			} );
			const state3 = requestingResend( state2, {
				type: INVITE_RESEND_REQUEST_FAILURE,
				siteId: 12345,
				inviteId: '789_failure',
			} );
			expect( state3 ).to.eql( {
				12345: {
					'123456asdf789': 'success',
					'123_requesting': 'requesting',
					'456_success': 'success',
					'789_failure': 'failure',
				},
			} );
		} );

		test( 'should accumulate sites', () => {
			const original = deepFreeze( { 12345: { '123456asdf789': 'success' } } );
			const state = requestingResend( original, {
				type: INVITE_RESEND_REQUEST,
				siteId: 67890,
				inviteId: '789lkjh123456',
			} );
			expect( state ).to.eql( {
				12345: { '123456asdf789': 'success' },
				67890: { '789lkjh123456': 'requesting' },
			} );
		} );
	} );

	describe( '#deleting()', () => {
		test( 'should key requests by site ID and invite ID', () => {
			const state = deleting(
				{},
				{
					type: INVITES_DELETE_REQUEST,
					siteId: 12345,
					inviteIds: [ '123456asdf789' ],
				}
			);
			expect( state ).to.eql( {
				12345: { '123456asdf789': 'requesting' },
			} );
		} );

		test( 'should use value success for successful deletes', () => {
			const state = deleting(
				{},
				{
					type: INVITES_DELETE_REQUEST_SUCCESS,
					siteId: 12345,
					inviteIds: [ '123456asdf789' ],
				}
			);
			expect( state ).to.eql( {
				12345: { '123456asdf789': 'success' },
			} );
		} );

		test( 'should use value failure for failed deletes', () => {
			const state = deleting(
				{},
				{
					type: INVITES_DELETE_REQUEST_FAILURE,
					siteId: 12345,
					inviteIds: [ '123456asdf789' ],
				}
			);
			expect( state ).to.eql( {
				12345: { '123456asdf789': 'failure' },
			} );
		} );

		test( 'should handle multiple invites per request', () => {
			const state = deleting(
				{},
				{
					type: INVITES_DELETE_REQUEST,
					siteId: 12345,
					inviteIds: [ '123456asdf789', '789lkjh123456' ],
				}
			);
			expect( state ).to.eql( {
				12345: { '123456asdf789': 'requesting', '789lkjh123456': 'requesting' },
			} );
		} );

		test( 'should accumulate invites', () => {
			const original = deepFreeze( { 12345: { '123456asdf789': 'success' } } );
			const state1 = deleting( original, {
				type: INVITES_DELETE_REQUEST,
				siteId: 12345,
				inviteIds: [ '123_requesting' ],
			} );
			expect( state1 ).to.eql( {
				12345: { '123456asdf789': 'success', '123_requesting': 'requesting' },
			} );
			const state2 = deleting( state1, {
				type: INVITES_DELETE_REQUEST_SUCCESS,
				siteId: 12345,
				inviteIds: [ '456_success', '457_success' ],
			} );
			expect( state2 ).to.eql( {
				12345: {
					'123456asdf789': 'success',
					'123_requesting': 'requesting',
					'456_success': 'success',
					'457_success': 'success',
				},
			} );
			const state3 = deleting( state2, {
				type: INVITES_DELETE_REQUEST_FAILURE,
				siteId: 12345,
				inviteIds: [ '123_requesting', '789_failure' ],
			} );
			expect( state3 ).to.eql( {
				12345: {
					'123456asdf789': 'success',
					'123_requesting': 'failure',
					'456_success': 'success',
					'457_success': 'success',
					'789_failure': 'failure',
				},
			} );
		} );

		test( 'should accumulate sites', () => {
			const original = deepFreeze( { 12345: { '123456asdf789': 'success' } } );
			const state = deleting( original, {
				type: INVITES_DELETE_REQUEST,
				siteId: 67890,
				inviteIds: [ '789lkjh123456' ],
			} );
			expect( state ).to.eql( {
				12345: { '123456asdf789': 'success' },
				67890: { '789lkjh123456': 'requesting' },
			} );
		} );
	} );
} );
