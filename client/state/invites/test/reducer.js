/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { requesting, items, requestingResend } from '../reducer';
import {
	INVITES_REQUEST,
	INVITES_REQUEST_SUCCESS,
	INVITE_RESEND_REQUEST,
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
		test( 'should key invites by site ID', () => {
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
							user: {
								login: 'chicken',
								email: false,
								name: 'Pollo',
								avatar_URL:
									'https://2.gravatar.com/avatar/eba3ff8480f481053bbd52b2a08c6136?s=96&d=identicon&r=G',
							},
						},
					],
				}
			);
			expect( state ).to.eql( {
				12345: [
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
			} );
		} );

		test( 'should accumulate sites', () => {
			const original = {
				12345: [
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
			};
			const state = items( original, {
				type: INVITES_REQUEST_SUCCESS,
				siteId: 67890,
				invites: [
					{
						invite_key: '9876fdas54321',
						role: 'follower',
						is_pending: true,
						user: {
							login: 'celery',
							email: false,
							name: 'Apio',
							avatar_URL:
								'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
						},
					},
				],
			} );
			expect( state ).to.eql( {
				12345: [
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
				67890: [
					{
						key: '9876fdas54321',
						role: 'follower',
						isPending: true,
						user: {
							login: 'celery',
							email: false,
							name: 'Apio',
							avatar_URL:
								'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
						},
					},
				],
			} );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				12345: [
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
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				12345: [
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
					12345: [
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
							hasExtraInvalidProperty: true,
						},
					],
				} );
				const state = items( original, { type: DESERIALIZE } );

				expect( state ).to.eql( {} );
			} );

			test( 'should not load invalid persisted state (2)', () => {
				const original = deepFreeze( {
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
				} );
				const state = items( original, { type: DESERIALIZE } );

				expect( state ).to.eql( {} );
			} );
		} );
	} );

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
