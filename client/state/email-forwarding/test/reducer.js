/** @format */

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
} from 'state/action-types';

const TEST_MAILBOX_EXAMPLE_DOT_COM = {
	email: 'test@example.com',
	mailbox: 'test',
	domain: 'example.com',
	forward_address: 'test@forward.com',
	active: true,
	created: 1551136603,
};

const TEST_MAILBOX_TEST_DOT_COM = {
	email: 'example@test.com',
	mailbox: 'example',
	domain: 'test.com',
	forward_address: 'test@forward.com',
	active: true,
	created: 1551136603,
};

describe( 'emailForwardsReducer', () => {
	describe( 'requesting email forwards', () => {
		test( 'should save data', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
			} );

			expect( state ).to.eql( {
				'example.com': {
					forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
					requesting: false,
					requestError: false,
				},
			} );
		} );

		test( 'should set requestError to false', () => {
			const prevState = {
				'example.com': {
					forwards: null,
					requesting: false,
					requestError: true,
				},
			};

			const state = emailForwardsReducer( prevState, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
			} );

			expect( state ).to.eql( {
				'example.com': {
					forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
					requesting: false,
					requestError: false,
				},
			} );
		} );

		test( 'should reset data on request to server', () => {
			const prevState = {
				'example.com': {
					forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
					requesting: false,
					requestError: false,
				},
			};

			const nextState = emailForwardsReducer( prevState, {
				type: EMAIL_FORWARDING_REQUEST,
				domainName: 'example.com',
			} );

			expect( nextState ).to.eql( {
				'example.com': {
					forwards: null,
					requesting: true,
					requestError: false,
				},
			} );
		} );

		test( 'should reset data only for specific domainName on request', () => {
			const prevState = {
				'example.com': {
					forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
					requesting: false,
					requestError: false,
				},
				'test.com': {
					forwards: [ TEST_MAILBOX_TEST_DOT_COM ],
					requesting: false,
					requestError: false,
				},
			};

			const nextState = emailForwardsReducer( prevState, {
				type: EMAIL_FORWARDING_REQUEST,
				domainName: 'example.com',
			} );

			expect( nextState ).to.eql( {
				'example.com': {
					forwards: null,
					requesting: true,
					requestError: false,
				},
				'test.com': {
					forwards: [ TEST_MAILBOX_TEST_DOT_COM ],
					requesting: false,
					requestError: false,
				},
			} );
		} );
	} );

	describe( 'requesting email forward error', () => {
		test( 'should set request error to true', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_FAILURE,
				domainName: 'example.com',
			} );

			expect( state ).to.eql( {
				'example.com': {
					forwards: null,
					requesting: false,
					requestError: true,
				},
			} );
		} );
	} );

	describe( 'adding email forwards', () => {
		test( 'adding email forward should insert temporary forward to list', () => {
			const state = emailForwardsReducer(
				{
					'example.com': {
						forwards: [],
					},
				},
				{
					type: EMAIL_FORWARDING_ADD_REQUEST,
					domainName: 'example.com',
					mailbox: 'test',
					destination: 'test@forward.com',
				}
			);

			expect( state ).to.eql( {
				'example.com': {
					forwards: [
						{
							email: 'test@example.com',
							mailbox: 'test',
							domain: 'example.com',
							forward_address: 'test@forward.com',
							active: false,
							temporary: true,
						},
					],
					requesting: false,
					requestError: false,
				},
			} );
		} );

		test( 'adding email forward should insert temporary forward to list when intially null', () => {
			const state = emailForwardsReducer(
				{
					'example.com': {
						forwards: null,
					},
				},
				{
					type: EMAIL_FORWARDING_ADD_REQUEST,
					domainName: 'example.com',
					mailbox: 'test',
					destination: 'test@forward.com',
				}
			);

			expect( state ).to.eql( {
				'example.com': {
					forwards: [
						{
							email: 'test@example.com',
							mailbox: 'test',
							domain: 'example.com',
							forward_address: 'test@forward.com',
							active: false,
							temporary: true,
						},
					],
					requesting: false,
					requestError: false,
				},
			} );
		} );
	} );
} );
