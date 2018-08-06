/** @format */
// Initialize polyfills before any dependencies are loaded
import './polyfills';

/**
 * External dependencies
 */
import debugFactory from 'debug';
import ReactDom from 'react-dom';
import page from 'page';

/**
 * Internal dependencies
 */
import loginModule from 'login';
import { createReduxStore } from 'state/login';
import setupContextMiddleware from './lib/setup-context-middleware';

const debug = debugFactory( 'calypso' );

function render( context ) {
	ReactDom.render( context.layout, document.getElementById( 'wpcom' ) );
}

const clientRouter = ( route, ...middlewares ) => {
	page( route, ...middlewares, render );
};

window.AppBoot = () => {
	debug( 'boot login page' );
	const reduxStore = createReduxStore( {} );
	setupContextMiddleware( reduxStore );
	loginModule( clientRouter );
	page.start();
};
