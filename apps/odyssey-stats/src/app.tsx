/**
 * Global polyfills
 */
// `init-app-config` has to be the first import, because there could be packages reference it in their side effect.
// eslint-disable-next-line import/order
import './lib/init-app-config';
import { QueryClient } from '@tanstack/react-query';
import page from 'page';
import '@automattic/calypso-polyfills';
import { createStore, applyMiddleware, compose, Store, Middleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { getPathWithUpdatedQueryString } from 'calypso/my-sites/stats/utils';
import { WithAddReducer } from 'calypso/state/add-reducer';
import currentUser from 'calypso/state/current-user/reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import config from './lib/config-api';
import setLocale from './lib/set-locale';
import { setupContextMiddleware } from './page-middleware/setup-context';
import registerStatsPages from './routes';

import 'calypso/assets/stylesheets/style.scss';
import './app.scss';

async function AppBoot() {
	const siteId = config( 'blog_id' );
	const localeSlug = config( 'i18n_locale_slug' ) || config( 'i18n_default_locale_slug' ) || 'en';

	const rootReducer = combineReducers( {
		currentUser,
		sites,
	} );

	// TODO: fix `intial_state` typo.
	let initialState = config( 'intial_state' );
	// Fix missing user.localeSlug in `initial_state`.
	initialState = {
		...initialState,
		currentUser: {
			...initialState.currentUser,
			user: { ...initialState.currentUser.user, localeSlug },
		},
	};

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

	if ( ! window.location?.hash ) {
		// Redirect to the default stats page.
		window.location.hash = `#!/stats/day/${ siteId }`;
	} else {
		// The URL could already gets broken by page.js by the appended `?page=stats`.
		window.location.hash = `#!${ getPathWithUpdatedQueryString(
			{},
			window.location.hash.substring( 2 )
		) }`;
	}

	// Ensure locale files are loaded before rendering.
	setLocale( localeSlug ).then( () => {
		registerStatsPages( window.location.pathname + window.location.search );

		// HACK: getPathWithUpdatedQueryString filters duplicate query parameters added by `page.js`.
		// It has to come after `registerStatsPages` because the duplicate string added in the function.
		page.show( `${ getPathWithUpdatedQueryString( {}, window.location.hash.substring( 2 ) ) }` );
	} );
}

AppBoot();
