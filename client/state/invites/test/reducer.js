/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items, requestingResend } from '../reducer';
import { INVITE_RESEND_REQUEST, SERIALIZE, DESERIALIZE } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	describe( '#items()', () => {
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
								'https://0.gravatar.com/avatar/0c4d46844039ba935f69208615e9010c?s=96&d=identicon&r=G',
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
								'https://0.gravatar.com/avatar/0c4d46844039ba935f69208615e9010c?s=96&d=identicon&r=G',
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
									'https://0.gravatar.com/avatar/0c4d46844039ba935f69208615e9010c?s=96&d=identicon&r=G',
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
									'https://0.gravatar.com/avatar/0c4d46844039ba935f69208615e9010c?s=96&d=identicon&r=G',
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
