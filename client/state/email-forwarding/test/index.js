/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import emailForwardsReducer from '../reducer';
import { EMAIL_FORWARDING_RECEIVE, EMAIL_FORWARDING_REQUEST } from 'state/action-types';

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
	test( 'should save data', () => {
		const state = emailForwardsReducer( undefined, {
			type: EMAIL_FORWARDING_RECEIVE,
			domainName: 'example.com',
			data: {
				forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
			},
		} );

		expect( state ).to.eql( {
			'example.com': {
				forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
				isRequesting: false,
				forwardsError: null,
			},
		} );
	} );

	test( 'should reset data on request to server', () => {
		const prevState = {
			'example.com': {
				forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
				isRequesting: false,
				forwardsError: null,
			},
		};

		const nextState = emailForwardsReducer( prevState, {
			type: EMAIL_FORWARDING_REQUEST,
			domainName: 'example.com',
		} );

		expect( nextState ).to.eql( {
			'example.com': {
				forwards: null,
				isRequesting: true,
				forwardsError: null,
			},
		} );
	} );

	test( 'should reset data only for specific domainName on request', () => {
		const prevState = {
			'example.com': {
				forwards: [ TEST_MAILBOX_EXAMPLE_DOT_COM ],
				isRequesting: false,
				forwardsError: null,
			},
			'test.com': {
				forwards: [ TEST_MAILBOX_TEST_DOT_COM ],
				isRequesting: false,
				forwardsError: null,
			},
		};

		const nextState = emailForwardsReducer( prevState, {
			type: EMAIL_FORWARDING_REQUEST,
			domainName: 'example.com',
		} );

		expect( nextState ).to.eql( {
			'example.com': {
				forwards: null,
				isRequesting: true,
				forwardsError: null,
			},
			'test.com': {
				forwards: [ TEST_MAILBOX_TEST_DOT_COM ],
				isRequesting: false,
				forwardsError: null,
			},
		} );
	} );
} );
