/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { setSection as setSectionAction } from 'state/ui/actions';
import noop from 'lodash/noop';
import page from 'page';
import isEmpty from 'lodash/isEmpty';
import pathToRegexp from 'path-to-regexp';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import LayoutLoggedOut from 'layout/logged-out';

const debug = debugFactory( 'calypso:controller' );

let routes = [];
let routeMatcher = pathToRegexp( routes );

/**
 * @param { object } context -- Middleware context
 * @param { function } next -- Call next middleware in chain
 *
 * Produce a `LayoutLoggedOut` element in `context.layout`, using
 * `context.primary`, `context.secondary`, and `context.tertiary` to populate it.
*/
export function makeLoggedOutLayout( context, next ) {
	const { store, primary, secondary, tertiary } = context;
	context.layout = (
		<ReduxProvider store={ store }>
			<LayoutLoggedOut primary={ primary }
				secondary={ secondary }
				tertiary={ tertiary } />
		</ReduxProvider>
	);
	next();
}

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
	routes.push( route );
	routeMatcher = pathToRegexp( routes );
	page( route, ...[ ...middlewares, render ] );
}

export function setSection( section ) {
	return ( context, next = noop ) => {
		context.store.dispatch( setSectionAction( section ) );

		next();
	};
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

export function isIsomorphicRoute( path ) {
	return routeMatcher.exec( path );
}

export function previousLayoutIsSingleTree() {
	return ! isEmpty( document.getElementsByClassName( 'wp-singletree-layout' ) );
}
