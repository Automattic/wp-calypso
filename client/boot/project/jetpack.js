/**
 * External dependencies
 */
const React = require( 'react' ),
	ReactDom = require( 'react-dom' ),
	store = require( 'store' ),
	debug = require( 'debug' )( 'calypso' ),
	page = require( 'page' ),
	includes = require( 'lodash/includes' );

/**
 * Internal dependencies
 */
const config = require( 'config' ),
	normalize = require( 'lib/route/normalize' ),
	{ isLegacyRoute } = require( 'lib/route/legacy-routes' );

import { getSectionName } from 'state/ui/selectors';

function renderLayout( reduxStore ) {
	const Layout = require( 'controller' ).ReduxWrappedLayout;

	const layoutElement = React.createElement( Layout, {
		store: reduxStore
	} );

	ReactDom.render(
		layoutElement,
		document.getElementById( 'wpcom' )
	);

	debug( 'Main layout rendered.' );
}

export function utils() {
	debug( 'Executing Jetpack utils.' );
}

export const configureReduxStore = ( currentUser, reduxStore ) => {
	debug( 'Executing Jetpack configure Redux store.' );
};

export function setupMiddlewares( currentUser, reduxStore ) {
	debug( 'Executing Jetpack setup middlewares.' );

	// Render Layout only for non-isomorphic sections.
	// Isomorphic sections will take care of rendering their Layout last themselves.
	if ( ! document.getElementById( 'primary' ) ) {
		renderLayout( reduxStore );
	}

	page( '*', function( context, next ) {
		// Don't normalize legacy routes - let them fall through and be unhandled
		// so that page redirects away from Calypso
		if ( isLegacyRoute( context.pathname ) ) {
			return next();
		}

		return normalize( context, next );
	} );

	page( '*', function( context, next ) {
		const path = context.pathname;

		// Bypass this global handler for legacy routes
		// to avoid bumping stats and changing focus to the content
		if ( isLegacyRoute( path ) ) {
			return next();
		}

		next();
	} );

	require( 'my-sites' )();

	/*
	 * Layouts with differing React mount-points will not reconcile correctly,
	 * so remove an existing single-tree layout by re-rendering if necessary.
	 *
	 * TODO (@seear): Converting all of Calypso to single-tree layout will
	 * make this unnecessary.
	 */
	page( '*', function( context, next ) {
		const previousLayoutIsSingleTree = !! (
			document.getElementsByClassName( 'wp-singletree-layout' ).length
		);

		const singleTreeSections = [ 'account-recovery', 'login', 'posts-custom', 'theme', 'themes', 'preview' ];
		const sectionName = getSectionName( context.store.getState() );
		const isMultiTreeLayout = ! includes( singleTreeSections, sectionName );

		if ( isMultiTreeLayout && previousLayoutIsSingleTree ) {
			debug( 'Re-rendering multi-tree layout' );
			ReactDom.unmountComponentAtNode( document.getElementById( 'wpcom' ) );
			renderLayout( context.store );
		} else if ( ! isMultiTreeLayout && ! previousLayoutIsSingleTree ) {
			debug( 'Unmounting multi-tree layout' );
			ReactDom.unmountComponentAtNode( document.getElementById( 'primary' ) );
			ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		}
		next();
	} );
}
