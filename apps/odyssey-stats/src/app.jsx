/**
 * Global polyfills
 */
import './load-config';
import config from '@automattic/calypso-config';
import '@automattic/calypso-polyfills';
import { QueryClient } from 'react-query';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
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
	registerStatsPages( window.location.pathname + window.location.search );

	// HACK: page.js adds a `?...page=stats&...` query param to the URL in Odyssey on page refresh everytime.
	// Test whether there are two query strings (two '?').
	if ( window.location.hash.replaceAll( /[^?]/g, '' ).length > 1 ) {
		// If so, we remove the last '?' and the query string following it with the lazy match regex.
		window.location.hash = window.location.hash.replace( /(\?[^?]*)\?.*page=stats.*$/, '$1' );
	}
}

AppBoot();
