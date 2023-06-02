/**
 * Global polyfills
 */
import './load-config';
import config from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import page from 'page';
import '@automattic/calypso-polyfills';
import { createStore, applyMiddleware, compose, Store, Middleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { WithAddReducer } from 'calypso/state/add-reducer';
import currentUser from 'calypso/state/current-user/reducer';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
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

export async function AppBoot() {
	const rootReducer = combineReducers( {
		currentUser,
		sites,
	} );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const initialState = config( 'intial_state' ) as any;

	const localeSlug = getCurrentUserLocale( initialState );

	const queryClient = new QueryClient();

	const store = createStore(
		rootReducer,
		initialState,
		compose(
			addReducerEnhancer,
			applyMiddleware( thunkMiddleware, wpcomApiMiddleware as Middleware )
		)
	);

	setStore( store as Store & WithAddReducer );
	setupContextMiddleware( store, queryClient );

	if ( window.location?.hash ) {
		// The URL could already gets broken by page.js by the appended `?page=advertising`.
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
		if ( 'disabled' in item ) {
			item.disabled = true;
		}
	} );
}

AppBoot();
