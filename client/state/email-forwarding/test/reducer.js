/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import emailForwardsReducer from '../reducer';
import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REQUEST_FAILURE,
	EMAIL_FORWARDING_ADD_REQUEST,
	EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
	EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
	EMAIL_FORWARDING_REMOVE_REQUEST,
	EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
} from 'calypso/state/action-types';

const TEST_MAILBOX_EXAMPLE_DOT_COM = {
	email: 'test@example.com',
	mailbox: 'test',
	domain: 'example.com',
	forward_address: 'test@forward.com',
	active: true,
	created: 1551136603,
};

const TEST_MX_RECORD_EXAMPLE_DOT_COM = {
	server: 'mx.test.com.',
	priority: 10,
};

describe( 'emailForwardsReducer', () => {
	describe( 'reducing EMAIL_FORWARDING_REQUEST', () => {
		const action = {
			type: EMAIL_FORWARDING_REQUEST,
			domainName: 'example.com',
		};

		test( 'should set type to null', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).to.have.nested.property( 'example\\.com.type', null );
		} );

		test( 'should set requesting to true', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).to.have.nested.property( 'example\\.com.requesting', true );
		} );

		test( 'should set requestError to false', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).to.have.nested.property( 'example\\.com.requestError', false );
		} );

		test( 'should set forwards to null', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).to.have.nested.property( 'example\\.com.forwards', null );
		} );

		test( 'should set mxServers to null', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).to.have.nested.property( 'example\\.com.mxServers', null );
		} );
	} );

	describe( 'reducing EMAIL_FORWARDING_REQUEST_FAILURE', () => {
		const action = {
			type: EMAIL_FORWARDING_REQUEST_FAILURE,
			domainName: 'example.com',
			error: { message: 'An error has occured' },
		};

		test( 'should set type to null', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).to.have.nested.property( 'example\\.com.type', null );
		} );

		test( 'should set requesting to false', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).to.have.nested.property( 'example\\.com.requesting', false );
		} );

		test( 'should set requestError to response error message if a message exists on error', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).to.have.deep.nested.property(
				'example\\.com.requestError',
				'An error has occured'
			);
		} );

		test( 'should set requestError to true if a message does not exists on error', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_FAILURE,
				domainName: 'example.com',
				error: true,
			} );

			expect( state ).to.have.nested.property( 'example\\.com.requestError', true );
		} );

		test( 'should set forwards to null', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).to.have.nested.property( 'example\\.com.forwards', null );
		} );

		test( 'should set mxServers to null', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).to.have.nested.property( 'example\\.com.mxServers', null );
		} );
	} );

	describe( 'reducing EMAIL_FORWARDING_REQUEST_SUCCESS', () => {
		test( 'should set type for a response of type `forward`', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {
					forwards: [],
					type: 'forward',
				},
			} );

			expect( state ).to.have.nested.property( 'example\\.com.type', 'forward' );
		} );

		test( 'should set type for a response of type `custom`', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {
					mx_servers: [],
					type: 'custom',
				},
			} );

			expect( state ).to.have.nested.property( 'example\\.com.type', 'custom' );
		} );

		test( 'should set type for a response of type `google-apps`', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {
					type: 'google-apps',
				},
			} );

			expect( state ).to.have.nested.property( 'example\\.com.type', 'google-apps' );
		} );

		test( 'should set type for a response of type `google-apps-another-provider`', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {
					forwards: [],
					type: 'google-apps-another-provider',
				},
			} );

			expect( state ).to.have.nested.property(
				'example\\.com.type',
				'google-apps-another-provider'
			);
		} );

		test( 'should set requestError to false from a response of any type', () => {
			const prevState = {
				'example.com': {
					forwards: null,
					requesting: false,
					requestError: { message: 'error message' },
					type: null,
					mxServers: [],
				},
			};

			const state = emailForwardsReducer( prevState, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {
					forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
					type: 'forward',
				},
			} );

			expect( state ).to.have.nested.property( 'example\\.com.requestError', false );
		} );

		test( 'should set requesting to false from a response of any type', () => {
			const prevState = {
				'example.com': {
					forwards: null,
					requesting: true,
					requestError: false,
					type: null,
					mxServers: [],
				},
			};

			const state = emailForwardsReducer( prevState, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {
					forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
					type: 'forward',
				},
			} );

			expect( state ).to.have.nested.property( 'example\\.com.requesting', false );
		} );

		test( 'should set forwards from a response of type `forward`', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {
					forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
					type: 'forward',
				},
			} );

			expect( state ).to.have.deep.nested.property( 'example\\.com.forwards', [
				TEST_MAILBOX_EXAMPLE_DOT_COM,
			] );
		} );

		test( 'should set forwards to an empty array from any other response', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {},
			} );

			expect( state ).to.have.deep.nested.property( 'example\\.com.forwards', [] );
		} );

		test( 'should set mxServers from a response of type `custom`', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {
					mx_servers: [ TEST_MX_RECORD_EXAMPLE_DOT_COM ],
					type: 'custom',
				},
			} );

			expect( state ).to.have.deep.nested.property( 'example\\.com.mxServers', [
				TEST_MX_RECORD_EXAMPLE_DOT_COM,
			] );
		} );

		test( 'should set mxServers to an empty array from any other responses', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {},
			} );

			expect( state ).to.have.deep.nested.property( 'example\\.com.mxServers', [] );
		} );
	} );

	describe( 'reducing EMAIL_FORWARDING_ADD_REQUEST', () => {
		test( 'should add new temporary forward to forwards', () => {
			const state = emailForwardsReducer(
				{
					forwards: [],
				},
				{
					type: EMAIL_FORWARDING_ADD_REQUEST,
					domainName: 'example.com',
					mailbox: 'a',
					destination: 'original@mail.com',
				}
			);

			expect( state ).to.have.deep.nested.property( 'example\\.com.forwards', [
				{
					email: 'a@example.com',
					mailbox: 'a',
					domain: 'example.com',
					forward_address: 'original@mail.com',
					active: false,
					temporary: true,
				},
			] );
		} );

		test( 'should add new temporary forward to forwards in ascending alpha order', () => {
			const state = emailForwardsReducer(
				{
					'example.com': {
						forwards: [
							{
								email: 'a@example.com',
								mailbox: 'a',
								domain: 'example.com',
								forward_address: 'original@mail.com',
								active: true,
								created: 1551136603,
							},
							{
								email: 'c@example.com',
								mailbox: 'c',
								domain: 'example.com',
								forward_address: 'original@mail.com',
								active: true,
								created: 1551136603,
							},
						],
					},
				},
				{
					type: EMAIL_FORWARDING_ADD_REQUEST,
					domainName: 'example.com',
					mailbox: 'b',
					destination: 'original@mail.com',
				}
			);

			expect( state ).to.have.deep.nested.property( 'example\\.com.forwards[1]', {
				email: 'b@example.com',
				mailbox: 'b',
				domain: 'example.com',
				forward_address: 'original@mail.com',
				active: false,
				temporary: true,
			} );
		} );
	} );

	describe( 'reducing EMAIL_FORWARDING_ADD_REQUEST_SUCCESS', () => {
		const initialState = {
			'example.com': {
				forwards: [
					{
						email: 'a@example.com',
						mailbox: 'a',
						domain: 'example.com',
						forward_address: 'original@mail.com',
						active: true,
						created: 1551136603,
					},
					{
						email: 'b@example.com',
						mailbox: 'b',
						domain: 'example.com',
						forward_address: 'original@mail.com',
						active: false,
						temporary: true,
					},
					{
						email: 'c@example.com',
						mailbox: 'c',
						domain: 'example.com',
						forward_address: 'original@mail.com',
						active: true,
						created: 1551136603,
					},
				],
			},
		};

		test( 'should make temporary forward permenant', () => {
			const state = emailForwardsReducer( initialState, {
				type: EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
				domainName: 'example.com',
				mailbox: 'b',
				verified: false,
			} );

			expect( state ).to.have.nested.property( 'example\\.com.forwards[1].temporary', false );
		} );

		test( 'should set verified on already-verified new forward', () => {
			const state = emailForwardsReducer( initialState, {
				type: EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
				domainName: 'example.com',
				mailbox: 'b',
				verified: true,
			} );

			expect( state ).to.have.nested.property( 'example\\.com.forwards[1].active', true );
		} );
	} );

	describe( 'reducing EMAIL_FORWARDING_ADD_REQUEST_FAILURE', () => {
		test( 'should remove temporary forward', () => {
			const state = emailForwardsReducer(
				{
					'example.com': {
						forwards: [
							{
								email: 'a@example.com',
								mailbox: 'a',
								domain: 'example.com',
								forward_address: 'original@mail.com',
								active: true,
								created: 1551136603,
							},
							{
								email: 'b@example.com',
								mailbox: 'b',
								domain: 'example.com',
								forward_address: 'original@mail.com',
								active: false,
								temporary: true,
							},
							{
								email: 'c@example.com',
								mailbox: 'c',
								domain: 'example.com',
								forward_address: 'original@mail.com',
								active: true,
								created: 1551136603,
							},
						],
					},
				},
				{
					type: EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
					domainName: 'example.com',
					mailbox: 'b',
					destination: 'original@mail.com',
					error: true,
				}
			);

			expect( state ).to.have.nested.property( 'example\\.com.forwards' );
			expect( state[ 'example.com' ].forwards ).to.eql( [
				{
					email: 'a@example.com',
					mailbox: 'a',
					domain: 'example.com',
					forward_address: 'original@mail.com',
					active: true,
					created: 1551136603,
				},
				{
					email: 'c@example.com',
					mailbox: 'c',
					domain: 'example.com',
					forward_address: 'original@mail.com',
					active: true,
					created: 1551136603,
				},
			] );
		} );

		test( 'should remove temporary forward in event email is duplicated', () => {
			const state = emailForwardsReducer(
				{
					'example.com': {
						forwards: [
							{
								email: 'a@example.com',
								mailbox: 'a',
								domain: 'example.com',
								forward_address: 'original@mail.com',
								active: true,
								created: 1551136603,
							},
							{
								email: 'b@example.com',
								mailbox: 'b',
								domain: 'example.com',
								forward_address: 'original@mail.com',
								active: false,
								temporary: true,
							},
							{
								email: 'b@example.com',
								mailbox: 'b',
								domain: 'example.com',
								forward_address: 'original@mail.com',
								active: true,
								created: 1551137704,
							},
						],
					},
				},
				{
					type: EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
					domainName: 'example.com',
					mailbox: 'b',
					destination: 'original@mail.com',
					error: true,
				}
			);

			expect( state ).to.have.nested.property( 'example\\.com.forwards' );
			expect( state[ 'example.com' ].forwards ).to.eql( [
				{
					email: 'a@example.com',
					mailbox: 'a',
					domain: 'example.com',
					forward_address: 'original@mail.com',
					active: true,
					created: 1551136603,
				},
				{
					email: 'b@example.com',
					mailbox: 'b',
					domain: 'example.com',
					forward_address: 'original@mail.com',
					active: true,
					created: 1551137704,
				},
			] );
		} );
	} );

	describe( 'reducing EMAIL_FORWARDING_REMOVE_REQUEST', () => {
		const initialState = {
			'example.com': {
				forwards: [
					{
						email: 'a@example.com',
						mailbox: 'a',
						domain: 'example.com',
						forward_address: 'original@mail.com',
						active: true,
						created: 1551136603,
					},
					{
						email: 'b@example.com',
						mailbox: 'b',
						domain: 'example.com',
						forward_address: 'original@mail.com',
						active: true,
						created: 1551137704,
					},
				],
			},
		};

		test( 'should make mailbox to be removed temporary', () => {
			const state = emailForwardsReducer( initialState, {
				type: EMAIL_FORWARDING_REMOVE_REQUEST,
				domainName: 'example.com',
				mailbox: 'b',
			} );

			expect( state ).to.have.nested.property( 'example\\.com.forwards[1].temporary', true );
		} );
	} );

	describe( 'reducing EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE', () => {
		const initialState = {
			'example.com': {
				forwards: [
					{
						email: 'a@example.com',
						mailbox: 'a',
						domain: 'example.com',
						forward_address: 'original@mail.com',
						active: true,
						created: 1551136603,
					},
					{
						email: 'b@example.com',
						mailbox: 'b',
						domain: 'example.com',
						forward_address: 'original@mail.com',
						active: true,
						created: 1551137704,
						temporary: true,
					},
				],
			},
		};

		test( 'should make mailbox that was failed to be removed untemporary', () => {
			const state = emailForwardsReducer( initialState, {
				type: EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
				domainName: 'example.com',
				mailbox: 'b',
				error: true,
			} );

			expect( state ).to.have.nested.property( 'example\\.com.forwards[1].temporary', false );
		} );
	} );

	describe( 'reducing EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS', () => {
		const initialState = {
			'example.com': {
				forwards: [
					{
						email: 'a@example.com',
						mailbox: 'a',
						domain: 'example.com',
						forward_address: 'original@mail.com',
						active: true,
						created: 1551136603,
					},
					{
						email: 'b@example.com',
						mailbox: 'b',
						domain: 'example.com',
						forward_address: 'original@mail.com',
						active: true,
						created: 1551137704,
						temporary: true,
					},
				],
			},
		};

		test( 'should remove removed mailbox', () => {
			const state = emailForwardsReducer( initialState, {
				type: EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS,
				domainName: 'example.com',
				mailbox: 'b',
			} );

			expect( state ).to.have.nested.property( 'example\\.com.forwards' );
			expect( state[ 'example.com' ].forwards ).to.eql( [
				{
					email: 'a@example.com',
					mailbox: 'a',
					domain: 'example.com',
					forward_address: 'original@mail.com',
					active: true,
					created: 1551136603,
				},
			] );
		} );
	} );
} );
