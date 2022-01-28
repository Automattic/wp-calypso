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
import analyticsMiddleware from 'calypso/state/analytics/middleware';
import consoleDispatcher from 'calypso/state/console-dispatch';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import currentUser from 'calypso/state/current-user/reducer';
import {
	reducer as httpData,
	enhancer as httpDataEnhancer,
} from 'calypso/state/data-layer/http-data';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import happychatMiddleware from 'calypso/state/happychat/middleware';
import { openChat } from 'calypso/state/happychat/ui/actions';
import { requestHappychatEligibility } from 'calypso/state/happychat/user/actions';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import 'calypso/assets/stylesheets/style.scss';
import Happychat from './happychat';

async function AppBoot() {
	const rootReducer = combineReducers( {
		httpData,
		currentUser,
		sites,
	} );

	const store = createStore(
		rootReducer,
		compose(
			consoleDispatcher,
			addReducerEnhancer,
			httpDataEnhancer,
			applyMiddleware(
				thunkMiddleware,
				wpcomApiMiddleware,
				analyticsMiddleware,
				happychatMiddleware
			)
		)
	);

	setStore( store );
	const user = await rawCurrentUserFetch().then( filterUserObject );
	if ( user ) {
		store.dispatch( setCurrentUser( user ) );
	}
	initializeAnalytics( user || undefined, getSuperProps( store ) );

	store.dispatch( requestHappychatEligibility() );
	store.dispatch( openChat() );

	ReactDom.render(
		<Provider store={ store }>
			<Happychat />
		</Provider>,
		document.getElementById( 'wpcom' )
	);
}

AppBoot();
