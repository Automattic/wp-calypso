/** @format */

/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import page from 'page';

/**
 * Internal Dependencies
 */
import config from 'config';
import Layout from 'layout';
import LayoutLoggedOut from 'layout/logged-out';
import { login } from 'lib/paths';
import { makeLayoutMiddleware } from './shared.js';
import { getCurrentUser } from 'state/current-user/selectors';
import { getImmediateLoginEmail, getImmediateLoginLocale } from 'state/immediate-login/selectors';
import userFactory from 'lib/user';

/**
 * Re-export
 */
export { setSection, setUpLocale } from './shared.js';

const user = userFactory();

export const ReduxWrappedLayout = ( { store, primary, secondary, redirectUri } ) => (
	<ReduxProvider store={ store }>
		{ getCurrentUser( store.getState() ) ? (
			<Layout primary={ primary } secondary={ secondary } user={ user } />
		) : (
			<LayoutLoggedOut primary={ primary } secondary={ secondary } redirectUri={ redirectUri } />
		) }
	</ReduxProvider>
);

export const makeLayout = makeLayoutMiddleware( ReduxWrappedLayout );

/**
 * Isomorphic routing helper, client side
 *
 * @param { string } route - A route path
 * @param { ...function } middlewares - Middleware to be invoked for route
 *
 * This function is passed to individual sections' controllers via
 * `server/bundler/loader`. Sections are free to either ignore it, or use it
 * instead of directly calling `page` for linking routes and middlewares in
 * order to be also usable for server-side rendering (and isomorphic routing).
 * `clientRouter` then also renders the element tree contained in `context.layout`
 * (or, if that is empty, in `context.primary`) to the respectively corresponding
 * divs.
 */
export function clientRouter( route, ...middlewares ) {
	page( route, ...middlewares, render );
}

export function redirectLoggedIn( context, next ) {
	const currentUser = getCurrentUser( context.store.getState() );

	if ( currentUser ) {
		page.redirect( '/' );
		return;
	}

	next();
}

export function redirectLoggedOut( context, next ) {
	const state = context.store.getState();
	const currentUser = getCurrentUser( state );

	if ( ! currentUser ) {
		const loginParameters = {
			isNative: config.isEnabled( 'login/native-login-links' ),
			redirectTo: context.path,
		};

		// Pass along "login_email" and "login_locale" parameters from the
		// original URL, to ensure the login form is pre-filled with the
		// correct email address and built with the correct language (when
		// either of those are requested).
		const login_email = getImmediateLoginEmail( state );
		if ( login_email ) {
			loginParameters.emailAddress = login_email;
		}
		const login_locale = getImmediateLoginLocale( state );
		if ( login_locale ) {
			loginParameters.locale = login_locale;
		}

		return page.redirect( login( loginParameters ) );
	}
	next();
}

export function render( context ) {
	ReactDom.render( context.layout, document.getElementById( 'wpcom' ) );
}
