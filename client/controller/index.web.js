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
import Layout from 'layout';
import LayoutLoggedOut from 'layout/logged-out';
import nuxWelcome from 'layout/nux-welcome';
import translatorInvitation from 'layout/community-translator/invitation-utils';
import { makeLayoutMiddleware } from './shared.js';
import { getCurrentUser } from 'state/current-user/selectors';
import userFactory from 'lib/user';
import sitesFactory from 'lib/sites-list';
import debugFactory from 'debug';
import { renderWithReduxStore } from 'lib/react-helpers';

/**
 * Re-export
 */
export { setSection } from './shared.js';

const user = userFactory();
const sites = sitesFactory();
const debug = debugFactory( 'calypso:controller' );

export const ReduxWrappedLayout = ( { store, primary, secondary, tertiary } ) => (
	<ReduxProvider store={ store }>
		{ getCurrentUser( store.getState() )
			? <Layout primary={ primary }
				secondary={ secondary }
				tertiary={ tertiary }
				user={ user }
				sites={ sites }
				nuxWelcome={ nuxWelcome }
				translatorInvitation={ translatorInvitation }
			/>
			: <LayoutLoggedOut primary={ primary }
				secondary={ secondary }
				tertiary={ tertiary } />
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

export function render( context ) {
	context.layout
		? renderSingleTree( context )
		: renderSeparateTrees( context );
}

function renderSingleTree( context ) {
	ReactDom.render(
		context.layout,
		document.getElementById( 'wpcom' )
	);
}

function renderSeparateTrees( context ) {
	renderPrimary( context );
	renderSecondary( context );
}

function renderPrimary( context ) {
	const { primary, store } = context;

	if ( primary ) {
		debug( 'Rendering primary', primary );
		renderWithReduxStore( primary, 'primary', store );
	}
}

function renderSecondary( context ) {
	const { secondary, store } = context;

	if ( secondary === null ) {
		debug( 'Unmounting secondary' );
		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	} else if ( secondary !== undefined ) {
		debug( 'Rendering secondary' );
		renderWithReduxStore( secondary, 'secondary', store );
	}
}
