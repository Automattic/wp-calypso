/**
 * @vitest-environment jsdom
 */
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { vi } from 'vitest';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import { postLoginRequest } from 'calypso/state/login/utils';
import { loginUserWithTwoFactorVerificationCode } from '../login-user-with-two-factor-verification-code';

vi.mock( 'calypso/state/login/utils', () => ( {
	postLoginRequest: vi.fn( () => Promise.resolve( { body: { data: {} } } ) ),
	getErrorFromHTTPError: vi.fn( () => ( { code: 'error', message: 'error' } ) ),
} ) );

vi.mock( 'calypso/state/login/actions/remote-login-user', () => ( {
	remoteLoginUser: vi.fn( () => Promise.resolve() ),
} ) );

vi.mock( 'calypso/blocks/login/utils/get-blackbox-session-id', () => ( {
	getBlackboxSessionId: vi.fn( () => Promise.resolve( 'a-freshly-collected-session' ) ),
} ) );

const mockStore = configureStore( [ thunk ] );

const loginState = ( blackboxSessionId ) => ( {
	login: {
		twoFactorAuth: {
			user_id: 123456,
			two_step_nonce_authenticator: 'a-two-step-nonce',
		},
		consumedBlackboxSessionId: blackboxSessionId,
	},
} );

const dispatchVerificationCode = ( blackboxSessionId ) =>
	mockStore( loginState( blackboxSessionId ) ).dispatch(
		loginUserWithTwoFactorVerificationCode( '123456', 'authenticator' )
	);

describe( 'loginUserWithTwoFactorVerificationCode', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	test( 'forwards the session id captured on the password step', async () => {
		await dispatchVerificationCode( 'ABCDEFGHIJKLMNOPQRSTuv' );

		const [ action, body ] = postLoginRequest.mock.calls[ 0 ];
		expect( action ).toBe( 'two-step-authentication-endpoint' );
		expect( body.blackbox_session_id ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );
	} );

	test( 'omits the field when the password step captured no session', async () => {
		await dispatchVerificationCode( null );

		const [ , body ] = postLoginRequest.mock.calls[ 0 ];
		expect( body ).not.toHaveProperty( 'blackbox_session_id' );
	} );

	test( 'reads the id from state rather than collecting a new session', async () => {
		await dispatchVerificationCode( 'ABCDEFGHIJKLMNOPQRSTuv' );

		// Collecting here would flush the code entry form's behavioral data and
		// mint a session unrelated to the one /verify scored.
		expect( getBlackboxSessionId ).not.toHaveBeenCalled();
	} );

	test( 'leaves the rest of the two-step payload intact', async () => {
		await dispatchVerificationCode( 'ABCDEFGHIJKLMNOPQRSTuv' );

		const [ , body ] = postLoginRequest.mock.calls[ 0 ];
		expect( body ).toMatchObject( {
			user_id: 123456,
			auth_type: 'authenticator',
			two_step_code: '123456',
			two_step_nonce: 'a-two-step-nonce',
			remember_me: true,
		} );
	} );
} );
