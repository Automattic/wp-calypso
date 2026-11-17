/**
 * @jest-environment jsdom
 */
import { get as webauthnGet } from '@github/webauthn-json';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE } from 'calypso/state/action-types';
import loginReducer from 'calypso/state/login/reducer';
import { HTTPError, postLoginRequest } from 'calypso/state/login/utils';
import { loginUserWithSecurityKey } from '../login-user-with-security-key';

// Only the network call is mocked. The real HTTPError and decoder run, so these tests
// catch the action misclassifying HTTP failures as browser errors.
jest.mock( 'calypso/state/login/utils', () => ( {
	...jest.requireActual( 'calypso/state/login/utils' ),
	postLoginRequest: jest.fn(),
} ) );

jest.mock( 'calypso/state/login/actions/remote-login-user', () => ( {
	remoteLoginUser: jest.fn( () => Promise.resolve() ),
} ) );

jest.mock( '@github/webauthn-json', () => ( {
	get: jest.fn( () => Promise.resolve( { response: {} } ) ),
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	...jest.requireActual( 'calypso/state/analytics/actions' ),
	recordTracksEventWithClientId: ( name, properties ) => ( {
		type: 'TEST_RECORD_TRACKS_EVENT',
		name,
		properties,
	} ),
} ) );

const mockStore = configureStore( [ thunk ] );

const loginState = ( consumedBlackboxSessionId ) => ( {
	login: {
		twoFactorAuth: {
			user_id: 123456,
			two_step_nonce_webauthn: 'a-webauthn-nonce',
		},
		consumedBlackboxSessionId,
	},
} );

const dispatchSecurityKey = ( consumedBlackboxSessionId ) =>
	mockStore( loginState( consumedBlackboxSessionId ) ).dispatch( loginUserWithSecurityKey() );

const GENERIC_MESSAGE = 'Oops! Something went wrong. Please try again.';

const httpError = ( status, body ) =>
	new HTTPError( { status }, typeof body === 'string' ? body : JSON.stringify( body ) );

const endpointError = ( code, message ) =>
	httpError( 400, { success: false, data: { errors: [ { code, message } ] } } );

const browserError = ( name, message = '' ) => Object.assign( new Error( message ), { name } );

const challengeResponse = ( twoStepNonce ) => ( {
	body: { data: { challenge: 'a-challenge', two_step_nonce: twoStepNonce } },
} );

/**
 * Dispatches the action against a mock store and returns what it rejected with,
 * along with the Tracks events it recorded.
 */
const dispatchFailingSecurityKey = async () => {
	const store = mockStore( loginState( null ) );
	const error = await store.dispatch( loginUserWithSecurityKey() ).catch( ( e ) => e );
	const tracksEvents = store
		.getActions()
		.filter( ( action ) => action.type === 'TEST_RECORD_TRACKS_EVENT' );
	const failure = store
		.getActions()
		.find( ( action ) => action.type === TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE );

	return { error, failure, tracksEvents };
};

describe( 'loginUserWithSecurityKey', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		postLoginRequest.mockResolvedValue( { body: { data: { token_links: [] } } } );
	} );

	test( 'forwards the session id the password step spent on both requests', async () => {
		await dispatchSecurityKey( 'ABCDEFGHIJKLMNOPQRSTuv' );

		const [ challengeAction, challengeBody ] = postLoginRequest.mock.calls[ 0 ];
		const [ authAction, authBody ] = postLoginRequest.mock.calls[ 1 ];

		expect( challengeAction ).toBe( 'webauthn-challenge-endpoint' );
		expect( challengeBody.blackbox_session_id ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );

		// The authentication request is the one that announces an outcome on the
		// wpcom side, so it is the one that has to carry the id.
		expect( authAction ).toBe( 'webauthn-authentication-endpoint' );
		expect( authBody.blackbox_session_id ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );
	} );

	test( 'omits the field when the password step spent no session', async () => {
		await dispatchSecurityKey( null );

		for ( const [ , body ] of postLoginRequest.mock.calls ) {
			expect( body ).not.toHaveProperty( 'blackbox_session_id' );
		}
	} );

	test( 'leaves the rest of the webauthn payload intact', async () => {
		await dispatchSecurityKey( 'ABCDEFGHIJKLMNOPQRSTuv' );

		const [ , authBody ] = postLoginRequest.mock.calls[ 1 ];
		expect( authBody ).toMatchObject( {
			user_id: 123456,
			auth_type: 'webauthn',
			two_step_nonce: 'a-webauthn-nonce',
			remember_me: true,
		} );
		expect( authBody.client_data ).toEqual( expect.any( String ) );
	} );

	describe( 'when an endpoint rejects the request', () => {
		test( 'shows the message the server sent for a rejected key', async () => {
			const message =
				"Hmm, that key doesn't seem to work. Please double-check your key and try again.";
			postLoginRequest
				.mockResolvedValueOnce( challengeResponse( 'a-fresh-nonce' ) )
				.mockRejectedValueOnce( endpointError( 'invalid_webauthn_assertion_object', message ) );

			const { error, failure, tracksEvents } = await dispatchFailingSecurityKey();

			const expected = { code: 'invalid_webauthn_assertion_object', message, field: 'global' };
			expect( error ).toEqual( expected );
			expect( failure.error ).toEqual( expected );
			expect( tracksEvents ).toEqual( [
				expect.objectContaining( {
					name: 'calypso_login_security_key_failure',
					properties: { error: 'invalid_webauthn_assertion_object' },
				} ),
			] );
		} );

		test( 'reports an expired session from the challenge request', async () => {
			const message = 'Your session has expired, please go back to the login screen.';
			postLoginRequest.mockRejectedValueOnce( endpointError( 'invalid_two_step_nonce', message ) );

			const { error, tracksEvents } = await dispatchFailingSecurityKey();

			expect( error ).toEqual( { code: 'invalid_two_step_nonce', message, field: 'global' } );
			expect( tracksEvents ).toHaveLength( 1 );
			expect( tracksEvents[ 0 ].properties ).toEqual( { error: 'invalid_two_step_nonce' } );
		} );

		test.each( [
			[
				// What the verification throttle sends: wp_die answers JSON requests with a
				// top-level message and no `data.errors`.
				'a throttled request',
				429,
				{
					code: 'wp_die',
					message: 'You have exceeded the login limit, you can try again in 60 minutes.',
					data: { status: 429 },
					additional_errors: [],
				},
			],
			[ 'an HTML body', 502, '<html><body>Bad gateway</body></html>' ],
			[ 'an empty body', 500, '' ],
		] )( 'falls back to a generic message for %s', async ( _, status, body ) => {
			postLoginRequest.mockRejectedValueOnce( httpError( status, body ) );

			const { error, tracksEvents } = await dispatchFailingSecurityKey();

			expect( error ).toEqual( { code: 'http_error', message: GENERIC_MESSAGE, field: 'global' } );
			expect( tracksEvents ).toHaveLength( 1 );
			expect( tracksEvents[ 0 ].properties ).toEqual( { error: 'http_error' } );
		} );
	} );

	describe( 'when the browser prompt fails', () => {
		test( 'keeps the browser message for a cancelled prompt', async () => {
			postLoginRequest.mockResolvedValueOnce( challengeResponse( 'a-fresh-nonce' ) );
			webauthnGet.mockRejectedValueOnce( browserError( 'NotAllowedError' ) );

			const { error, tracksEvents } = await dispatchFailingSecurityKey();

			expect( error ).toEqual( {
				code: 'NotAllowedError',
				message: 'The security key interaction timed out or was canceled. Please try again.',
				field: 'global',
			} );
			expect( tracksEvents ).toHaveLength( 1 );
			expect( tracksEvents[ 0 ].properties ).toEqual( { error: 'NotAllowedError' } );
		} );

		test( 'tracks an unfocused page as NotFocusedError', async () => {
			postLoginRequest.mockResolvedValueOnce( challengeResponse( 'a-fresh-nonce' ) );
			webauthnGet.mockRejectedValueOnce(
				browserError( 'NotAllowedError', 'The document is not focused.' )
			);

			const { error, tracksEvents } = await dispatchFailingSecurityKey();

			expect( error.message ).toMatch( /the page is not active for authentication/ );
			expect( tracksEvents ).toHaveLength( 1 );
			expect( tracksEvents[ 0 ].properties ).toEqual( { error: 'NotFocusedError' } );
		} );
	} );

	describe( 'nonce handling', () => {
		// The real reducer applies nonce updates, so these tests see the nonce each
		// request actually sends rather than only the dispatched update.
		const createLoginStore = () =>
			createStore(
				combineReducers( { login: loginReducer } ),
				loginState( null ),
				applyMiddleware( thunk )
			);

		test( 'sends the nonce from the challenge with the assertion', async () => {
			postLoginRequest.mockResolvedValueOnce( challengeResponse( 'a-fresh-nonce' ) );

			await createLoginStore().dispatch( loginUserWithSecurityKey() );

			const [ authAction, authBody ] = postLoginRequest.mock.calls[ 1 ];
			expect( authAction ).toBe( 'webauthn-authentication-endpoint' );
			expect( authBody.two_step_nonce ).toBe( 'a-fresh-nonce' );
		} );

		test( 'retries with the challenge nonce after the browser prompt is cancelled', async () => {
			const store = createLoginStore();
			postLoginRequest.mockResolvedValueOnce( challengeResponse( 'a-replacement-nonce' ) );
			webauthnGet.mockRejectedValueOnce( browserError( 'NotAllowedError' ) );

			await store.dispatch( loginUserWithSecurityKey() ).catch( () => {} );
			await store.dispatch( loginUserWithSecurityKey() );

			const [ retryAction, retryBody ] = postLoginRequest.mock.calls[ 1 ];
			expect( retryAction ).toBe( 'webauthn-challenge-endpoint' );
			expect( retryBody.two_step_nonce ).toBe( 'a-replacement-nonce' );
		} );
	} );
} );
