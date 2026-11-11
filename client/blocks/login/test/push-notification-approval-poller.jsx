/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import PushNotificationApprovalPoller from 'calypso/blocks/login/two-factor-authentication/push-notification-approval-poller';

jest.mock( 'calypso/state/login/actions/remote-login-user', () => ( {
	remoteLoginUser: jest.fn( () => Promise.resolve() ),
} ) );

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockStore = configureStore( [ thunk ] );

const loginState = ( consumedBlackboxSessionId ) => ( {
	login: {
		twoFactorAuth: {
			user_id: 123456,
			two_step_nonce_push: 'a-push-nonce',
			push_web_token: 'a-push-token',
		},
		consumedBlackboxSessionId,
	},
} );

const renderPoller = ( consumedBlackboxSessionId ) =>
	render(
		<Provider store={ mockStore( loginState( consumedBlackboxSessionId ) ) }>
			<PushNotificationApprovalPoller onSuccess={ () => {} } />
		</Provider>
	);

/**
 * Returns the body of the first poll as a URLSearchParams.
 */
const firstPollBody = () => mockFetch.mock.calls[ 0 ][ 1 ].body;

describe( 'PushNotificationApprovalPoller', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockFetch.mockResolvedValue( {
			json: () => Promise.resolve( { success: true, data: { token_links: [] } } ),
		} );
	} );

	test( 'forwards the session id the password step spent', async () => {
		renderPoller( 'ABCDEFGHIJKLMNOPQRSTuv' );

		await waitFor( () => expect( mockFetch ).toHaveBeenCalled() );

		const [ url, options ] = mockFetch.mock.calls[ 0 ];
		expect( url ).toContain( 'action=two-step-authentication-endpoint' );
		expect( options.method ).toBe( 'POST' );
		expect( firstPollBody().get( 'blackbox_session_id' ) ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );
	} );

	test( 'omits the field when the password step spent no session', async () => {
		renderPoller( null );

		await waitFor( () => expect( mockFetch ).toHaveBeenCalled() );

		expect( firstPollBody().has( 'blackbox_session_id' ) ).toBe( false );
	} );

	test( 'leaves the rest of the push payload intact', async () => {
		renderPoller( 'ABCDEFGHIJKLMNOPQRSTuv' );

		await waitFor( () => expect( mockFetch ).toHaveBeenCalled() );

		const body = firstPollBody();
		expect( body.get( 'user_id' ) ).toBe( '123456' );
		expect( body.get( 'auth_type' ) ).toBe( 'push' );
		expect( body.get( 'two_step_nonce' ) ).toBe( 'a-push-nonce' );
		expect( body.get( 'two_step_push_token' ) ).toBe( 'a-push-token' );
	} );
} );
