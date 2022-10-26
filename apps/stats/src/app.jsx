/**
 * Global polyfills
 */
import '@automattic/calypso-polyfills';
import debugFactory from 'debug';
import page from 'page';
import ReactDom from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
// import StatsSummary from 'calypso/my-sites/stats/index';
import { rawCurrentUserFetch, filterUserObject } from 'calypso/lib/user/shared-utils';
// import StatsOverview from 'calypso/my-sites/stats/overview.jsx';
import analyticsMiddleware from 'calypso/state/analytics/middleware';
import consoleDispatcher from 'calypso/state/console-dispatch';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import currentUser from 'calypso/state/current-user/reducer';
// import ui from 'calypso/state/ui/reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
// import statss from 'calypso/state/stats/reducer';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import { getUrlParts } from '../../../packages/calypso-url';
import registerStatsPages from './routes';
import 'calypso/assets/stylesheets/style.scss';

const debug = debugFactory( 'calypso' );

const setupContextMiddleware = ( reduxStore, reactQueryClient ) => {
	page( '*', ( context, next ) => {
		// page.js url parsing is broken so we had to disable it with `decodeURLComponents: false`
		const parsed = getUrlParts( context.canonicalPath );
		const path = parsed.pathname + parsed.search || null;
		context.prevPath = path === context.path ? false : path;
		context.query = Object.fromEntries( parsed.searchParams.entries() );

		context.hashstring = ( parsed.hash && parsed.hash.substring( 1 ) ) || '';
		// set `context.hash` (we have to parse manually)
		if ( context.hashstring ) {
			try {
				context.hash = Object.fromEntries(
					new globalThis.URLSearchParams( context.hashstring ).entries()
				);
			} catch ( e ) {
				debug( 'failed to query-string parse `location.hash`', e );
				context.hash = {};
			}
		} else {
			context.hash = {};
		}

		context.store = reduxStore;
		context.queryClient = reactQueryClient;

		// client version of the isomorphic method for redirecting to another page
		context.redirect = ( httpCode, newUrl = null ) => {
			if ( isNaN( httpCode ) && ! newUrl ) {
				newUrl = httpCode;
			}

			return page.replace( newUrl, context.state, false, false );
		};

		// Break routing and do full load for logout link in /me
		if ( context.pathname === '/wp-login.php' ) {
			window.location.href = context.path;
			return;
		}

		// Some paths live outside of Calypso and should be opened separately
		// Examples: /support, /forums
		// if ( isOutsideCalypso( context.pathname ) ) {
		// 	window.location.href = context.path;
		// 	return;
		// }

		next();
	} );

	page.exit( '*', ( context, next ) => {
		context.store = reduxStore;
		context.queryClient = reactQueryClient;

		next();
	} );
};

async function AppBoot() {
	const rootReducer = combineReducers( {
		currentUser,
		sites,
	} );

	const queryClient = new QueryClient();

	const store = createStore(
		rootReducer,
		compose(
			consoleDispatcher,
			addReducerEnhancer,
			applyMiddleware( thunkMiddleware, analyticsMiddleware, wpcomApiMiddleware )
		)
	);

	setStore( store );
	const user = await rawCurrentUserFetch().then( filterUserObject );
	if ( user ) {
		store.dispatch( setCurrentUser( user ) );
	}

	setupContextMiddleware( store, queryClient );

	registerStatsPages();

	ReactDom.render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }></Provider>
		</QueryClientProvider>,
		document.getElementById( 'wpcom' )
	);
	page();
}
AppBoot();
