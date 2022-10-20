/**
 * Global polyfills
 */
import '@automattic/calypso-polyfills';

import ReactDom from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
// import StatsSummary from 'calypso/my-sites/stats/index';
import { rawCurrentUserFetch, filterUserObject } from 'calypso/lib/user/shared-utils';
import StatsOverview from 'calypso/my-sites/stats/overview.jsx';
import analyticsMiddleware from 'calypso/state/analytics/middleware';
import consoleDispatcher from 'calypso/state/console-dispatch';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import currentUser from 'calypso/state/current-user/reducer';
// import ui from 'calypso/state/ui/reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
// import stats from 'calypso/state/stats/reducer';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import registerStatsPages from './routes';
import 'calypso/assets/stylesheets/style.scss';

async function AppBoot() {
	const rootReducer = combineReducers( {
		currentUser,
		sites,
	} );

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

	const queryClient = new QueryClient();

	ReactDom.render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<StatsOverview period="day" path="/stats/overview" />
			</Provider>
		</QueryClientProvider>,
		document.getElementById( 'wpcom' )
	);
}
AppBoot();
