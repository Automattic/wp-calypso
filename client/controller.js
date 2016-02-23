/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import startsWith from 'lodash/startsWith';

/**
 * Internal dependencies
 */
import page from 'page';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:controller' );

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
 * `clientRouter` then also renders React elements contained in `context.primary`.
 */
export function clientRouter( route, ...middlewares ) {
	page( route, ...[ ...middlewares, renderElements ] );
}

export function renderElements( context ) {
	renderPrimary( context );
	renderSecondary( context );
}

function renderPrimary( context ) {
	const { path, primary } = context;

	// FIXME: temporary hack until we have a proper isomorphic, one tree
	// routing solution (see https://github.com/Automattic/wp-calypso/pull/3302)
	// Do NOT do this!
	const sheetsDomElement = startsWith( path, '/themes' ) &&
		document.getElementsByClassName( 'themes__sheet' )[0];

	if ( primary && ! sheetsDomElement ) {
		debug( 'Rendering primary', context, path, primary );
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
