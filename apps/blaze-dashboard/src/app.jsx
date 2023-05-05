/**
 * Global polyfills
 */
import './load-config';
import config from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import page from 'page';
import '@automattic/calypso-polyfills';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import consoleDispatcher from 'calypso/state/console-dispatch';
import currentUser from 'calypso/state/current-user/reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import fixPath from './lib/fix-path';
import setLocale from './lib/set-locale';
import { setupContextMiddleware } from './page-middleware/setup-context';
import registerBlazeDashboardPages from './routes';

import 'calypso/assets/stylesheets/style.scss';
import './app.scss';

async function AppBoot() {
	const rootReducer = combineReducers( {
		currentUser,
		sites,
	} );

	const initialState = config( 'intial_state' );

	const localeSlug = initialState.currentUser.user.localeSlug;

	const queryClient = new QueryClient();

	const store = createStore(
		rootReducer,
		initialState,
		compose(
			consoleDispatcher,
			addReducerEnhancer,
			applyMiddleware( thunkMiddleware, wpcomApiMiddleware )
		)
	);

	setStore( store );
	setupContextMiddleware( store, queryClient );

	if ( window.location?.hash ) {
		// The URL could already gets broken by page.js by the appended `?page=jetpack-blaze`.
		window.location.hash = fixPath( window.location.hash );
	}

	// Ensure locale files are loaded before rendering.
	setLocale( localeSlug ).then( () => {
		registerBlazeDashboardPages( window.location.pathname + window.location.search );

		// HACK: We need to remove the extra queryString that page adds when we configure it as hashbang
		// To do this, we are showing the correct version of the path (after fixing it)
		page.show( fixPath( window.location.hash ) );
	} );

	// Disable conflicting Jetpack stylesheets
	document.querySelectorAll( 'link#forms-css' ).forEach( ( item ) => {
		item.disabled = true;
	} );
}

AppBoot();
