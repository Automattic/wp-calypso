/**
 * @jest-environment jsdom
 */
import { act, screen } from '@testing-library/react';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import WPLogin from 'calypso/login/wp-login';
import {
	LOGIN_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import loginReducer from 'calypso/state/login/reducer';
import oauth2ClientsReducer from 'calypso/state/oauth2-clients/reducer';
import initialReducer from 'calypso/state/reducer';
import { setRoute } from 'calypso/state/route/actions';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

// The two-factor forms render no page-level notice or footer of their own.
jest.mock( 'calypso/components/async-load', () => () => null );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/components/locale-suggestions', () => () => null );
jest.mock( 'calypso/lib/signup/use-entry-clarity-experiment', () => ( {
	__esModule: true,
	default: () => false,
	useEntryClarityLoginTreatment: () => false,
} ) );

const WOOCOMMERCE_PRODUCTION_CLIENT_ID = 50916;
const OTHER_CLIENT_ID = 12345;
const MESSAGE = 'Your session has expired, please go back to the login screen.';

/**
 * Renders the login page on `path`, then reports `failure` the way a failed request
 * would. The error has to arrive after the route is set, because the login reducer
 * clears request errors on every route change.
 */
const renderLogin = ( { clientId, twoFactorAuthType, failure } ) => {
	const path = twoFactorAuthType ? `/log-in/${ twoFactorAuthType }` : '/log-in';
	const reducer = initialReducer
		.addReducer( [ 'login' ], loginReducer )
		.addReducer( [ 'oauth2Clients' ], oauth2ClientsReducer )
		.addReducer( [ 'route' ], routeReducer );
	const store = createStore(
		reducer,
		{
			login: twoFactorAuthType
				? {
						twoFactorAuth: {
							user_id: 123456,
							two_step_supported_auth_types: [ 'webauthn' ],
							two_step_nonce_webauthn: 'a-webauthn-nonce',
						},
					}
				: {},
			oauth2Clients: {
				ui: { currentClientId: clientId },
				clients: { [ clientId ]: { id: clientId, name: 'client', title: 'Client' } },
			},
		},
		applyMiddleware( thunk )
	);
	store.dispatch( setRoute( path, {} ) );

	renderWithProvider(
		<WPLogin
			isJetpack={ false }
			locale="en"
			path={ path }
			twoFactorAuthType={ twoFactorAuthType }
		/>,
		{ store }
	);

	act( () => {
		store.dispatch( failure );
	} );
};

const twoFactorFailure = {
	type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
	error: { code: 'invalid_two_step_nonce', message: MESSAGE, field: 'global' },
};

describe( 'WPLogin two-factor error recovery', () => {
	beforeEach( () => {
		// jsdom doesn't implement window.scrollTo; the login block calls it on mount.
		window.scrollTo = jest.fn();
	} );

	test.each( [
		[ 'WooCommerce.com', WOOCOMMERCE_PRODUCTION_CLIENT_ID ],
		[ 'other clients', OTHER_CLIENT_ID ],
	] )(
		'shows the error once and a way back to login on the security key step for %s',
		( _, clientId ) => {
			renderLogin( { clientId, twoFactorAuthType: 'webauthn', failure: twoFactorFailure } );

			expect( screen.getAllByText( MESSAGE ) ).toHaveLength( 1 );
			expect( screen.getByText( MESSAGE ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'Back to Login' } ) ).toBeVisible();
		}
	);

	test( 'shows a login error once on the WooCommerce.com password step', () => {
		renderLogin( {
			clientId: WOOCOMMERCE_PRODUCTION_CLIENT_ID,
			failure: {
				type: LOGIN_REQUEST_FAILURE,
				error: { code: 'some_login_error', message: MESSAGE, field: 'global' },
			},
		} );

		expect( screen.getAllByText( MESSAGE ) ).toHaveLength( 1 );
	} );
} );
