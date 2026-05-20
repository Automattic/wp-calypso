/**
 * Global polyfills
 */
import '@automattic/calypso-polyfills';

import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { setupLocale } from 'calypso/boot/locale';
import { render } from 'calypso/controller/web-util';
import { initializeCurrentUser } from 'calypso/lib/user/shared-utils';
import initLoginSection from 'calypso/login';
import { getStateFromCache } from 'calypso/state/initial-state';
import { setStore } from 'calypso/state/redux-store';
import { setupMiddlewares, configureReduxStore } from './common';
import createStore from './store';

import 'calypso/assets/stylesheets/style.scss';

async function main() {
	const currentUser = await initializeCurrentUser();
	const store = createStore();
	setStore( store, getStateFromCache( currentUser?.ID ) );
	configureReduxStore( currentUser, store );
	setupMiddlewares( currentUser, store );
	setupLocale( currentUser, store );
	// Plain client (no persistence): /log-in is logged-out-only, so the user-keyed
	// cache from createQueryClient would never hit. Skips the async hydrate too.
	// If this boot ever needs to support logged-in users, switch to createQueryClient().
	const queryClient = new QueryClient();

	page( '*', ( context, next ) => {
		context.store = store;
		context.queryClient = queryClient;
		next();
	} );

	page.exit( '*', ( context, next ) => {
		context.store = store;
		context.queryClient = queryClient;
		next();
	} );

	initLoginSection( ( route, ...handlers ) => page( route, ...handlers, render ) );
	page.start();
}

main();
