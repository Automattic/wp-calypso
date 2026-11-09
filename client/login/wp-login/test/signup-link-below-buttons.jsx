/**
 * @jest-environment jsdom
 *
 * Run with:
 * yarn test-client client/login/wp-login/test/signup-link-below-buttons.jsx
 */
import { screen } from '@testing-library/react';
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

const renderLogin = ( { path, isJetpack = false } ) => {
	const reducer = initialReducer
		.addReducer( [ 'login' ], loginReducer )
		.addReducer( [ 'oauth2Clients' ], oauth2ClientsReducer )
		.addReducer( [ 'route' ], routeReducer );
	const store = createStore( reducer, {}, applyMiddleware( thunk ) );
	store.dispatch( setRoute( path, {} ) );

	renderWithProvider( <WPLogin isJetpack={ isJetpack } locale="en" path={ path } />, {
		store,
	} );
};

describe( 'WPLogin signup link below the buttons', () => {
	beforeEach( () => {
		// jsdom doesn't implement window.scrollTo; the login block calls it on mount.
		window.scrollTo = jest.fn();
	} );

	// CSS shows the footer line from 960px and the top-bar link below it; jsdom applies neither.
	test( 'gives the Jetpack login the footer signup line', () => {
		renderLogin( { path: '/log-in/jetpack', isJetpack: true } );

		expect( screen.getByText( /Don’t have an account\?/ ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Sign up' } ) ).toBeInTheDocument();
	} );

	test( 'keeps "New here? Create an account" on the main login', () => {
		renderLogin( { path: '/log-in' } );

		expect( screen.getByText( /New here\?/ ) ).toBeInTheDocument();
		expect( screen.queryByText( /Don’t have an account\?/ ) ).not.toBeInTheDocument();
	} );
} );
