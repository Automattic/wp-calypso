/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import { makeLayoutMiddleware } from './shared.js';
import Layout from 'layout';
import translatorInvitation from 'layout/community-translator/invitation-utils';
import LayoutLoggedOut from 'layout/logged-out';
import nuxWelcome from 'layout/nux-welcome';
import userFactory from 'lib/user';
import { getCurrentUser } from 'state/current-user/selectors';

/**
 * Re-export
 */
export { setSection, setUpLocale } from './shared.js';

const user = userFactory();

export const ReduxWrappedLayout = ( { store, primary, secondary, redirectUri } ) => (
	<ReduxProvider store={ store }>
		{ getCurrentUser( store.getState() )
			? <Layout primary={ primary }
				secondary={ secondary }
				user={ user }
				nuxWelcome={ nuxWelcome }
				translatorInvitation={ translatorInvitation }
			/>
			: <LayoutLoggedOut
				primary={ primary }
				secondary={ secondary }
				redirectUri={ redirectUri }
			/>
		}
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

function render( context ) {
	ReactDom.render(
		context.layout,
		document.getElementById( 'wpcom' )
	);
}
