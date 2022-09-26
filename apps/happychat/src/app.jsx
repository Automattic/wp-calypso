/**
 * Global polyfills
 */
import '@automattic/calypso-polyfills';

import { requestHappyChatAuth } from '@automattic/happychat-connection';
import { Icon, warning } from '@wordpress/icons';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { initializeAnalytics } from 'calypso/lib/analytics/init';
import getSuperProps from 'calypso/lib/analytics/super-props';
import { filterUserObject } from 'calypso/lib/user/shared-utils';
import analyticsMiddleware from 'calypso/state/analytics/middleware';
import audioMiddleware from 'calypso/state/audio/middleware';
import consoleDispatcher from 'calypso/state/console-dispatch';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import currentUser from 'calypso/state/current-user/reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import happychatMiddleware from 'calypso/state/happychat/middleware';
import { openChat } from 'calypso/state/happychat/ui/actions';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import 'calypso/assets/stylesheets/style.scss';
import Happychat from './happychat';
import { requestDataFromParent } from './request-auth-data-from-parent';
import './happychat.scss';

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
			applyMiddleware(
				thunkMiddleware,
				wpcomApiMiddleware,
				analyticsMiddleware,
				happychatMiddleware,
				audioMiddleware
			)
		)
	);

	setStore( store );

	let auth;
	let user;

	try {
		auth = await requestHappyChatAuth();
		user = filterUserObject( auth.fullUser );
	} catch ( _error ) {
		// this error most likely means we couldn't auth the user due to 3rd party cookies blockage
		// attempt to get auth information from the parent window (when this is opened in an iframe)
		try {
			const authFromParent = await requestDataFromParent();
			auth = authFromParent;
			user = filterUserObject( auth.fullUser );
		} catch ( error ) {
			// there are no 3rd party cookies nor auth data from the parent
			ReactDom.render(
				<div className="happy-chat-error-screen">
					<Icon icon={ warning } />
					<p>
						This app isn't meant to run independently when 3rd party cookies are blocked. Please
						either allow third party cookies, or open this app from the help center.
					</p>
				</div>,
				document.getElementById( 'wpcom' )
			);
			// throw the error to console log it and to stop execution
			throw error;
		}
	}

	initializeAnalytics( user || undefined, getSuperProps( store ) );
	if ( user ) {
		store.dispatch( setCurrentUser( user ) );
		store.dispatch( openChat() );
	}

	ReactDom.render(
		<Provider store={ store }>
			<Happychat auth={ auth } />
		</Provider>,
		document.getElementById( 'wpcom' )
	);
}

AppBoot();
