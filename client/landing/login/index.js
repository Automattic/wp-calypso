/**
 * Global polyfills
 */
import 'boot/polyfills';
import { hydrate, render } from 'controller/web-util';

/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';

/**
 * Internal dependencies
 */
import createStore from './store';
import { setupMiddlewares, configureReduxStore } from './common';
import initLoginSection from 'login';
import userFactory from 'lib/user';

const debug = debugFactory( 'calypso' );

import 'assets/stylesheets/style.scss';
// goofy import for environment badge, which is SSR'd
import 'components/environment-badge/style.scss';

// Create Redux store
const store = createStore();

setupMiddlewares( store );

page( '*', ( context, next ) => {
	context.store = store;
	next();
} );

page.exit( '*', ( context, next ) => {
	context.store = store;
	next();
} );

initLoginSection( ( route, ...handlers ) => page( route, ...handlers, renderHandler ) );
function renderHandler( context, next ) {
	( context.serverSideRender ? hydrate : render )( context );
	next();
}

const boot = currentUser => {
	debug( "Starting Calypso. Let's do this." );

	configureReduxStore( currentUser, store );
	setupMiddlewares( currentUser, store );
	page.start( { decodeURLComponents: false } );
};

window.AppBoot = () => {
	const user = userFactory();
	if ( user.initialized ) {
		boot( user );
	} else {
		user.once( 'change', () => boot( user ) );
	}
};
