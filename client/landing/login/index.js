/**
 * Global polyfills
 */
import 'boot/polyfills';
import { render } from 'controller/web-util';

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
import { setupLocale } from 'boot/locale';
import { setStore } from 'state/redux-store';

const debug = debugFactory( 'calypso' );

import 'assets/stylesheets/style.scss';
// goofy import for environment badge, which is SSR'd
import 'components/environment-badge/style.scss';

// Create Redux store
const store = createStore();
setStore( store );

const boot = ( currentUser ) => {
	debug( "Starting Calypso. Let's do this." );

	configureReduxStore( currentUser, store );
	setupMiddlewares( currentUser, store );
	setupLocale( currentUser.get(), store );

	page( '*', ( context, next ) => {
		context.store = store;
		next();
	} );

	page.exit( '*', ( context, next ) => {
		context.store = store;
		next();
	} );

	initLoginSection( ( route, ...handlers ) => page( route, ...handlers, render ) );
	page.start( { decodeURLComponents: false } );
};

window.AppBoot = () => {
	const user = userFactory();
	user.initialize().then( () => boot( user ) );
};
