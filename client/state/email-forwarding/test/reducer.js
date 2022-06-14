import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import emailForwardsReducer from '../reducer';

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

			expect( state ).toHaveProperty( [ 'example.com', 'type' ], null );
		} );

		test( 'should set requesting to true', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).toHaveProperty( [ 'example.com', 'requesting' ], true );
		} );

		test( 'should set requestError to false', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).toHaveProperty( [ 'example.com', 'requestError' ], false );
		} );

		test( 'should set forwards to null', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).toHaveProperty( [ 'example.com', 'forwards' ], null );
		} );

		test( 'should set mxServers to null', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).toHaveProperty( [ 'example.com', 'mxServers' ], null );
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

			expect( state ).toHaveProperty( [ 'example.com', 'type' ], null );
		} );

		test( 'should set requesting to false', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).toHaveProperty( [ 'example.com', 'requesting' ], false );
		} );

		test( 'should set requestError to response error message if a message exists on error', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).toHaveProperty( [ 'example.com', 'requestError' ], 'An error has occured' );
		} );

		test( 'should set requestError to true if a message does not exists on error', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_FAILURE,
				domainName: 'example.com',
				error: true,
			} );

			expect( state ).toHaveProperty( [ 'example.com', 'requestError' ], true );
		} );

		test( 'should set forwards to null', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).toHaveProperty( [ 'example.com', 'forwards' ], null );
		} );

		test( 'should set mxServers to null', () => {
			const state = emailForwardsReducer( undefined, action );

			expect( state ).toHaveProperty( [ 'example.com', 'mxServers' ], null );
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

			expect( state ).toHaveProperty( [ 'example.com', 'type' ], 'forward' );
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

			expect( state ).toHaveProperty( [ 'example.com', 'type' ], 'custom' );
		} );

		test( 'should set type for a response of type `google-apps`', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {
					type: 'google-apps',
				},
			} );

			expect( state ).toHaveProperty( [ 'example.com', 'type' ], 'google-apps' );
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

			expect( state ).toHaveProperty( [ 'example.com', 'type' ], 'google-apps-another-provider' );
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

			expect( state ).toHaveProperty( [ 'example.com', 'requestError' ], false );
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

			expect( state ).toHaveProperty( [ 'example.com', 'requesting' ], false );
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

			expect( state ).toHaveProperty(
				[ 'example.com', 'forwards' ],
				[ TEST_MAILBOX_EXAMPLE_DOT_COM ]
			);
		} );

		test( 'should set forwards to an empty array from any other response', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {},
			} );

			expect( state ).toHaveProperty( [ 'example.com', 'forwards' ], [] );
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

			expect( state ).toHaveProperty(
				[ 'example.com', 'mxServers' ],
				[ TEST_MX_RECORD_EXAMPLE_DOT_COM ]
			);
		} );

		test( 'should set mxServers to an empty array from any other responses', () => {
			const state = emailForwardsReducer( undefined, {
				type: EMAIL_FORWARDING_REQUEST_SUCCESS,
				domainName: 'example.com',
				response: {},
			} );

			expect( state ).toHaveProperty( [ 'example.com', 'mxServers' ], [] );
		} );
	} );
} );
