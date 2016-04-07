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
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:controller' );

/**
 * @param { object } -- `primary`, `secondary`, and `tertiary` functions, or null
 * @return { function } -- Middlware that creates a logged-out layout in `context.layout`
 *
 * Produce a `LayoutLoggedOut` element in `context.layout`, using
 * `primary`, `secondary`, and `tertiary` functions to populate it.
*/
export function makeLoggedOutLayout( { primary = noop, secondary = noop, tertiary = noop } = {} ) {
	return ( context, next ) => {
		context.layout = (
			<ReduxProvider store={ context.store }>
				<LayoutLoggedOut primary={ primary ? primary( context ) : null }
					secondary={ secondary ? secondary( context ) : null }
					tertiary={ tertiary ? tertiary( context ) : null } />
			</ReduxProvider>
		);
		next();
	};
};

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

export function setSection( section ) {
	return ( context, next = noop ) => {
		context.store.dispatch( setSectionAction( section ) );

		next();
	}
}

function render( context ) {
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
