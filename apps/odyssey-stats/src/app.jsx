/**
 * Global polyfills
 */
import './load-config';
import config from '@automattic/calypso-config';
import page from 'page';
import '@automattic/calypso-polyfills';
import { QueryClient } from 'react-query';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { getPathWithUpdatedQueryString } from 'calypso/my-sites/stats/utils';
import consoleDispatcher from 'calypso/state/console-dispatch';
import currentUser from 'calypso/state/current-user/reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import setLocale from './lib/set-locale';
import { setupContextMiddleware } from './page-middleware/setup-context';
import registerStatsPages from './routes';

import 'calypso/assets/stylesheets/style.scss';
import './app.scss';

const localeSlug = config( 'i18n_locale_slug' ) || config( 'i18n_default_locale_slug' ) || 'en';

async function AppBoot() {
	const siteId = config( 'blog_id' );

	const rootReducer = combineReducers( {
		currentUser,
		sites,
	} );

	let initialState = config( 'intial_state' );
	// Fix missing user.localeSlug in `intial_state`.
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
			consoleDispatcher,
			addReducerEnhancer,
			applyMiddleware( thunkMiddleware, wpcomApiMiddleware )
		)
	);

	setStore( store );
	setupContextMiddleware( store, queryClient );

	if ( ! window.location?.hash ) {
		window.location.hash = `#!/stats/day/${ siteId }`;
	} else {
		// The URL could already get broken by page.js by the appended `?page=stats`.
		window.location.hash = `#!${ getPathWithUpdatedQueryString(
			{},
			window.location.hash.substring( 2 )
		) }`;
	}

	registerStatsPages( window.location.pathname + window.location.search );

	// HACK: getPathWithUpdatedQueryString filters duplicate query parameters added by `page.js`.
	// It has to come after `registerStatsPages` because the duplicate string added in the function.
	page.show( `${ getPathWithUpdatedQueryString( {}, window.location.hash.substring( 2 ) ) }` );
}

setLocale( localeSlug ).then( AppBoot );
