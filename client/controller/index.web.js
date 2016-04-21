/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import page from 'page';
import isEmpty from 'lodash/isEmpty';
import pathToRegexp from 'path-to-regexp';

/**
 * Internal Dependencies
 */
import Layout from 'layout';
import layoutFocus from 'lib/layout-focus';
import nuxWelcome from 'layout/nux-welcome';
import translatorInvitation from 'layout/community-translator/invitation-utils';
import userFactory from 'lib/user';
import sitesFactory from 'lib/sites-list';
import debugFactory from 'debug';

/**
 * Re-export
 */
export { makeLoggedOutLayout, setSection } from './index.node.js';

const user = userFactory();
const sites = sitesFactory();
const debug = debugFactory( 'calypso:controller' );

let routes = [];
let routeMatcher = pathToRegexp( routes );

export function makeLayout( context, next ) {
	const { store, primary, secondary, tertiary } = context;

	context.layout = (
		<ReduxWrappedLayout store={ store }
			primary={ primary }
			secondary={ secondary }
			tertiary={ tertiary }
		/>
	);
	next();
};

export const ReduxWrappedLayout = ( { store, primary, secondary, tertiary } ) => (
	<ReduxProvider store={ store }>
		{ user.get()
			? <Layout primary={ primary }
				secondary={ secondary }
				tertiary={ tertiary }
				user={ user }
				sites={ sites }
				focus={ layoutFocus }
				nuxWelcome={ nuxWelcome }
				translatorInvitation={ translatorInvitation }
			/>
			: <Layout primary={ primary }
				secondary={ secondary }
				tertiary={ tertiary }
				focus={ layoutFocus } />
		}
	</ReduxProvider>
);

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

function render( context ) {
	context.layout
		? renderSingleTree( context )
		: renderSeparateTrees( context );
}

function renderSingleTree( context ) {
	if ( ! previousLayoutIsSingleTree() ) {
		unmountContentComponents();
	}

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

/**
 * Single-mount and multiple-mount react layouts are not compatible with each other
 * (they will not reconcile correctly) so we use the following functions to unmount
 * the previous layout on transition from one to the other.
 */

function unmountContentComponents() {
	debug( 'Unmounting existing incompatible content components' );
	ReactDom.unmountComponentAtNode( document.getElementById( 'primary' ) );
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
}

export function maybeUnmountLayout( context, next ) {
	if ( ! routeMatcher.exec( context.path ) && previousLayoutIsSingleTree() ) {
		debug( 'Unmounting existing incompatible single-tree layout' );
		ReactDom.unmountComponentAtNode( document.getElementById( 'wpcom' ) );

		ReactDom.render(
			React.createElement( ReduxWrappedLayout, { store: context.store } ),
			document.getElementById( 'wpcom' )
		);
	}
	next();
}

function previousLayoutIsSingleTree() {
	return ! isEmpty( document.getElementsByClassName( 'wp-singletree-layout' ) );
}
