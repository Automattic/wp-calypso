/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import page from 'page';

/**
 * Internal Dependencies
 */
import LayoutLoggedOut from 'layout/logged-out';
import nuxWelcome from 'layout/nux-welcome';
import translatorInvitation from 'layout/community-translator/invitation-utils';
import { makeLayoutMiddleware } from './shared.js';
import { getCurrentUser } from 'state/current-user/selectors';
import userFactory from 'lib/user';

/**
 * Re-export
 */
export { setSection, setUpLocale } from './shared.js';

const user = userFactory();

/**
 * Fetch the correct Layout based on whether or not the user is logged-in.
 *
 * @param {bool} loggedIn true if the user is logged-in, false otherwise
 * @returns {Promise} a Promise that resolves to the Layout component
 */
function getLayout( loggedIn ) {
	return new Promise( ( resolve ) => {
		if ( loggedIn ) {
			// If user is logged in, async load the main layout
			require.ensure( [], () => {
				const Layout = require( 'layout' );

				resolve(
					( { primary, secondary } ) => (
						<Layout
							primary={ primary }
							secondary={ secondary }
							user={ user }
							nuxWelcome={ nuxWelcome }
							translatorInvitation={ translatorInvitation }
						/>
					)
				);
			}, 'async-load-layout' );
		} else {
			resolve(
				( { primary, secondary, redirectUri } ) => (
					<LayoutLoggedOut
						primary={ primary }
						secondary={ secondary }
						redirectUri={ redirectUri }
					/>
				)
			);
		}
	} );
}

export function getReduxWrappedLayout( reduxStore ) {
	const loggedIn = getCurrentUser( reduxStore.getState() );

	return getLayout( loggedIn ).then( ( InnerLayout ) => (
		// Wrap the InnerLayout
		( { store, primary, secondary, redirectUri } ) => (
			<ReduxProvider store={ store }>
				<InnerLayout
					store={ store }
					primary={ primary }
					secondary={ secondary }
					redirectUri={ redirectUri }
				/>
			</ReduxProvider>
		)
	) );
}

export const makeLayout = makeLayoutMiddleware( getReduxWrappedLayout );

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
