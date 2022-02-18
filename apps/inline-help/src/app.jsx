/**
 * Global polyfills
 */
import '@automattic/calypso-polyfills';

import ReactDom from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import InlineHelpPopoverContent from 'calypso/blocks/inline-help/popover-content';
import QuerySites from 'calypso/components/data/query-sites';
import { initializeAnalytics } from 'calypso/lib/analytics/init';
import getSuperProps from 'calypso/lib/analytics/super-props';
import { rawCurrentUserFetch, filterUserObject } from 'calypso/lib/user/shared-utils';
import analyticsMiddleware from 'calypso/state/analytics/middleware';
import consoleDispatcher from 'calypso/state/console-dispatch';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import currentUser from 'calypso/state/current-user/reducer';
import happychatMiddleware from 'calypso/state/happychat/middleware';
import { requestHappychatEligibility } from 'calypso/state/happychat/user/actions';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
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
			applyMiddleware( thunkMiddleware, analyticsMiddleware, happychatMiddleware )
		)
	);

	setStore( store );
	const user = await rawCurrentUserFetch().then( filterUserObject );
	if ( user ) {
		store.dispatch( setCurrentUser( user ) );
	}
	initializeAnalytics( user || undefined, getSuperProps( store ) );

	store.dispatch( requestHappychatEligibility() );

	const queryClient = new QueryClient();

	ReactDom.render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<>
					<QuerySites allSites />
					<InlineHelpPopoverContent />
				</>
			</Provider>
		</QueryClientProvider>,
		document.getElementById( 'wpcom' )
	);
}

AppBoot();
