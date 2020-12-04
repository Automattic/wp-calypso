/**
 * Global polyfills
 */
import 'calypso/boot/polyfills';
import { render } from 'calypso/controller/web-util';

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
import initLoginSection from 'calypso/login';
import userFactory from 'calypso/lib/user';
import { setupLocale } from 'calypso/boot/locale';
import { setStore } from 'calypso/state/redux-store';

const debug = debugFactory( 'calypso' );

import 'calypso/assets/stylesheets/style.scss';
// goofy import for environment badge, which is SSR'd
import 'calypso/components/environment-badge/style.scss';

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
