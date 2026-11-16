/**
 * @jest-environment jsdom
 */
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import WPLogin from 'calypso/login/wp-login';
import loginReducer from 'calypso/state/login/reducer';
import oauth2ClientsReducer from 'calypso/state/oauth2-clients/reducer';
import initialReducer from 'calypso/state/reducer';
import { setRoute } from 'calypso/state/route/actions';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'calypso/components/async-load', () => () => null );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/components/locale-suggestions', () => () => null );

const renderLogin = ( query = {} ) => {
	const reducer = initialReducer
		.addReducer( [ 'login' ], loginReducer )
		.addReducer( [ 'oauth2Clients' ], oauth2ClientsReducer )
		.addReducer( [ 'route' ], routeReducer );
	const store = createStore( reducer, {}, applyMiddleware( thunk ) );
	store.dispatch( setRoute( '/log-in', query ) );

	const { container } = renderWithProvider(
		<WPLogin isJetpack={ false } locale="en" path="/log-in" />,
		{ store }
	);

	return container.querySelector( '.wp-login__main' );
};

describe( 'WPLogin stacked layout', () => {
	beforeEach( () => {
		// jsdom doesn't implement window.scrollTo; the login block calls it on mount.
		window.scrollTo = jest.fn();
	} );

	test( 'stacks the social buttons above the form on the plain WordPress.com login', () => {
		expect( renderLogin() ).toHaveClass( 'is-stacked-login' );
	} );

	test( 'keeps the side-by-side layout for Akismet redirects', () => {
		expect(
			renderLogin( {
				redirect_to:
					'https://wordpress.com/public.api/connect/?action=verify&service=akismet&back=https%3A%2F%2Fakismet.com%2Faccount%2F',
			} )
		).not.toHaveClass( 'is-stacked-login' );
	} );
} );
