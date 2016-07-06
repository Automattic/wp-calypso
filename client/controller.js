/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { setSection as setSectionAction } from 'state/ui/actions';
import noop from 'lodash/noop';
import pick from 'lodash/pick';

/**
 * Internal dependencies
 */
import page from 'page';
import LayoutLoggedOut from 'layout/logged-out';
import { getCurrentUser } from 'state/current-user/selectors';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:controller' );

const getLoggedInLayoutProps = ( () => {
	let props;
	return () => {
		if ( ! props && 'undefined' !== typeof global.window ) {
			props = {
				user: require( 'lib/user' )(),
				focus: require( 'lib/layout-focus' ),
				sites: require( 'lib/sites-list' )(),
				nuxWelcome: require( 'layout/nux-welcome' ),
				translatorInvitation: require( 'layout/community-translator/invitation-utils' )
			};
		}

		return props;
	};
} )();

/**
 * @param { object } context -- Middleware context
 * @param { function } next -- Call next middleware in chain
*/
export function makeLayout( context, next ) {
	const isLoggedIn = !! getCurrentUser( context.store.getState() );
	const Layout = isLoggedIn ? require( 'layout' ) : LayoutLoggedOut;

	const layoutProps = pick( context, 'primary', 'secondary', 'tertiary' );
	if ( isLoggedIn ) {
		Object.assign( layoutProps, getLoggedInLayoutProps() );
	}

	context.layout = (
		<ReduxProvider store={ context.store }>
			<Layout { ...layoutProps } />
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
	page( route, ...middlewares, render );
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
	const { primary, store } = context;

	if ( primary ) {
		debug( 'Rendering primary', primary );
		ReactDom.render(
			<ReduxProvider store={ store }>
				{ primary }
			</ReduxProvider>,
			document.getElementById( 'primary' )
		);
	}
}

function renderSecondary( context ) {
	const { secondary, store } = context;

	if ( secondary === null ) {
		debug( 'Unmounting secondary' );
		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	} else if ( secondary !== undefined ) {
		debug( 'Rendering secondary' );
		ReactDom.render(
			<ReduxProvider store={ store }>
				{ secondary }
			</ReduxProvider>,
			document.getElementById( 'secondary' )
		);
	}
}
