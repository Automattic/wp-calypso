/**
 * Global polyfills
 */
import './load-config';
import config from '@automattic/calypso-config';
import '@automattic/calypso-polyfills';
import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import { QueryClient } from 'react-query';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { loadUserUndeployedTranslations } from 'calypso/lib/i18n-utils/switch-locale';
import consoleDispatcher from 'calypso/state/console-dispatch';
import currentUser from 'calypso/state/current-user/reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import { setupContextMiddleware } from './page-middleware/setup-context';
import registerStatsPages from './routes';

const debug = debugFactory( 'apps:odyssey' );

import 'calypso/assets/stylesheets/style.scss';
import './app.scss';

const getLanguageFile = ( localeSlug ) => {
	const url = `https://widgets.wp.com/odyssey-stats/v1/languages/${ localeSlug }-v1.1.json`;

	return globalThis.fetch( url ).then( ( response ) => {
		if ( response.ok ) {
			return response.json();
		}
		return Promise.reject( response );
	} );
};

const setLocale = () => {
	const defaultLocale = config( 'i18n_default_locale_slug' ) || 'en';
	const siteLocale = config( 'i18n_locale_slug' );
	const localeSlug = siteLocale || defaultLocale;

	getLanguageFile( localeSlug ).then(
		// Success.
		( body ) => {
			if ( body ) {
				i18n.setLocale( body );
				loadUserUndeployedTranslations( localeSlug );
			}
		},
		// Failure.
		() => {
			debug(
				`Encountered an error loading locale file for ${ localeSlug }. Falling back to English.`
			);
		}
	);
};

async function AppBoot() {
	const siteId = config( 'blog_id' );

	const rootReducer = combineReducers( {
		currentUser,
		sites,
	} );

	const queryClient = new QueryClient();

	const store = createStore(
		rootReducer,
		config( 'intial_state' ) ?? {},
		compose(
			consoleDispatcher,
			addReducerEnhancer,
			applyMiddleware( thunkMiddleware, wpcomApiMiddleware )
		)
	);

	setStore( store );
	setLocale( store.dispatch );
	setupContextMiddleware( store, queryClient );

	if ( ! window.location?.hash ) {
		window.location.hash = `#!/stats/day/${ siteId }`;
	}
	registerStatsPages( config( 'admin_page_base' ) );
}
AppBoot();
