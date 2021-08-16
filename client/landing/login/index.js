/**
 * Global polyfills
 */
import 'calypso/boot/polyfills';

import page from 'page';
import { setupLocale } from 'calypso/boot/locale';
import { render } from 'calypso/controller/web-util';
import { initializeCurrentUser } from 'calypso/lib/user/shared-utils';
import initLoginSection from 'calypso/login';
import { setStore } from 'calypso/state/redux-store';
import { setupMiddlewares, configureReduxStore } from './common';
import createStore from './store';

import 'calypso/assets/stylesheets/style.scss';
// goofy import for environment badge, which is SSR'd
import 'calypso/components/environment-badge/style.scss';

const boot = ( currentUser ) => {
	const store = createStore();
	setStore( store, currentUser?.ID );
	configureReduxStore( currentUser, store );
	setupMiddlewares( currentUser, store );
	setupLocale( currentUser, store );

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

window.AppBoot = async () => {
	const user = await initializeCurrentUser();
	boot( user );
};
