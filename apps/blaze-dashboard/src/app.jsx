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
import { initializeAnalytics } from 'calypso/lib/analytics/init';
import getSuperProps from 'calypso/lib/analytics/super-props';
import analyticsMiddleware from 'calypso/state/analytics/middleware';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import currentUser from 'calypso/state/current-user/reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { setSelectedSiteId, setJetpackVersion } from 'calypso/state/ui/actions';
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

	const initialState = config( 'initial_state' );

	const user = initialState.currentUser.user;
	const localeSlug = user.localeSlug;

	const queryClient = new QueryClient();

	const store = createStore(
		rootReducer,
		initialState,
		compose(
			addReducerEnhancer,
			applyMiddleware( thunkMiddleware, wpcomApiMiddleware, analyticsMiddleware )
		)
	);

	setStore( store );
	setupContextMiddleware( store, queryClient );

	// Set selected site ID & current user
	store.dispatch( setSelectedSiteId( config( 'blog_id' ) ) );
	store.dispatch( setCurrentUser( user ) );
	if ( config.hasKey( 'jetpack_version' ) ) {
		store.dispatch( setJetpackVersion( config( 'jetpack_version' ) ) );
	}

	// Initialize analytics (we use the connected user only if Jetpack returns the user email)
	const superPropsFn = getSuperProps( store );
	initializeAnalytics( user?.email ? user : undefined, ( eventProperties ) =>
		superPropsFn( { ...eventProperties, force_site_id: true } )
	);

	if ( window.location?.hash ) {
		// The URL could already gets broken by page.js by the appended `?page=advertising`.
		window.location.hash = fixPath( window.location.hash );
	}

	// Ensure locale files are loaded before rendering.
	setLocale( localeSlug ).then( () => {
		registerBlazeDashboardPages( window.location.pathname + window.location.search );

		// Adds the section class name to the body
		document.querySelector( 'body' )?.classList.add( 'is-section-promote-post-i2' );

		// HACK: We need to remove the extra queryString that page adds when we configure it as hashbang
		// To do this, we are showing the correct version of the path (after fixing it)
		page.show( fixPath( window.location.hash ) );
	} );
}

AppBoot();
