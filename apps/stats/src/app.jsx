/**
 * Global polyfills
 */
import '@automattic/calypso-polyfills';

import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { initializeAnalytics } from 'calypso/lib/analytics/init';
import getSuperProps from 'calypso/lib/analytics/super-props';
import { rawCurrentUserFetch, filterUserObject } from 'calypso/lib/user/shared-utils';
import StatsSummary from 'calypso/my-sites/stats/summary';
import analyticsMiddleware from 'calypso/state/analytics/middleware';
import consoleDispatcher from 'calypso/state/console-dispatch';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import currentUser from 'calypso/state/current-user/reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { setStore } from 'calypso/state/redux-store';
import stats from 'calypso/state/stats/reducer';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import 'calypso/assets/stylesheets/style.scss';

async function AppBoot() {
	const rootReducer = combineReducers( {
		currentUser,
		stats,
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
	initializeAnalytics( user || undefined, getSuperProps( store ) );

	// store.dispatch( requestHappychatEligibility() );

	ReactDom.render(
		<Provider store={ store }>
			<StatsSummary />
		</Provider>,
		document.getElementById( 'wpcom' )
	);
}

AppBoot();
