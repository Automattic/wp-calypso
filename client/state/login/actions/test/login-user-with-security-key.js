/**
 * @jest-environment jsdom
 */
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { postLoginRequest } from 'calypso/state/login/utils';
import { loginUserWithSecurityKey } from '../login-user-with-security-key';

jest.mock( 'calypso/state/login/utils', () => ( {
	postLoginRequest: jest.fn(),
	getErrorFromHTTPError: jest.fn( () => ( { code: 'error', message: 'error' } ) ),
} ) );

jest.mock( 'calypso/state/login/actions/remote-login-user', () => ( {
	remoteLoginUser: jest.fn( () => Promise.resolve() ),
} ) );

jest.mock( '@github/webauthn-json', () => ( {
	get: jest.fn( () => Promise.resolve( { response: {} } ) ),
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
} );
