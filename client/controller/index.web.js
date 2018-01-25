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
import { makeLayoutMiddleware } from './shared.js';
import { getCurrentUser } from 'state/current-user/selectors';
import LoggedInLayout from 'layout-wrapper/logged-in';
import LoggedOutLayout from 'layout-wrapper/logged-out';

/**
 * Re-export
 */
export { setSection, setUpLocale } from './shared.js';

export const ReduxWrappedLayout = props => (
	<ReduxProvider store={ props.store }>
		{ getCurrentUser( props.store.getState() ) ? (
			<LoggedInLayout { ...props } />
		) : (
			<LoggedOutLayout { ...props } />
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

export function render( context ) {
	ReactDom.render( context.layout, document.getElementById( 'wpcom' ) );
}
