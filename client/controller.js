/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { setSection as setSectionAction } from 'state/ui/actions';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import page from 'page';
import LayoutLoggedOut from 'layout/logged-out';
import { getCurrentUser } from 'state/current-user/selectors';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:controller' );

/**
 * @param { object } context -- Middleware context
 * @param { function } next -- Call next middleware in chain
*/
export function makeLayout( context, next ) {
	const isLoggedIn = !! getCurrentUser( context.store.getState() );
	if ( ! isLoggedIn ) {
		context.layout = makeLoggedOutLayout( context );
	} // TODO: else { makeLoggedInLayout( context ); }
	next();
}

/**
 * @param { object } context -- Middleware context
 * @returns { object } `LoggedOutLayout` element
 *
 * Return a `LayoutLoggedOut` element, using `context.primary`,
 * `context.secondary`, and `context.tertiary` to populate it.
*/
function makeLoggedOutLayout( context ) {
	const { store, primary, secondary, tertiary } = context;
	return (
		<ReduxProvider store={ store }>
			<LayoutLoggedOut primary={ primary }
				secondary={ secondary }
				tertiary={ tertiary } />
		</ReduxProvider>
	);
}

/**
 * Isomorphic routing helper, client side
 *
 * This function is passed to individual sections' controllers via
 * `server/bundler/loader`. Sections are free to either ignore it, or use it
 * instead of directly calling `page` for linking routes and middlewares in
 * order to be also usable for server-side rendering (and isomorphic routing).
 */
export const clientRouter = page;

export function setSection( section ) {
	return ( context, next = noop ) => {
		context.store.dispatch( setSectionAction( section ) );
		next();
	};
}

/**
 * Client side renderer
 *
 * @param { object } context -- Middleware context
 *
 * Middleware to render the element tree contained in `context.layout` (or, if
 * that is empty, in `context.primary`) to the respectively corresponding divs.
 */
export function clientRenderer( context ) {
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
	const { primary } = context;

	if ( primary ) {
		debug( 'Rendering primary', primary );
		ReactDom.render(
			primary,
			document.getElementById( 'primary' )
		);
	}
}

function renderSecondary( context ) {
	if ( context.secondary === null ) {
		debug( 'Unmounting secondary' );
		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	} else if ( context.secondary !== undefined ) {
		debug( 'Rendering secondary' );
		ReactDom.render(
			context.secondary,
			document.getElementById( 'secondary' )
		);
	}
}
