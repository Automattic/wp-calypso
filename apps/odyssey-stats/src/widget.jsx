import './load-config';
import config from '@automattic/calypso-config';
import '@automattic/calypso-polyfills';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import StatsWidget from 'calypso/my-sites/customer-home/cards/features/stats';
import consoleDispatcher from 'calypso/state/console-dispatch';
import currentUser from 'calypso/state/current-user/reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import setLocale from './lib/set-locale';

import 'calypso/assets/stylesheets/style.scss';
import './widget.scss';

/**
 * Loads and runs the main chunk for Instant Search.
 */
function init() {
	const rootReducer = combineReducers( {
		currentUser,
		sites,
	} );

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
	store.dispatch( setSelectedSiteId( config( 'blog_id' ) ) );

	render(
		<Provider store={ store }>
			<StatsWidget />
		</Provider>,
		document.getElementById( 'dashboard_stats' )
	);
}

// Initialize Instant Search when DOMContentLoaded is fired, or immediately if it already has been.
if ( document.readyState !== 'loading' ) {
	init();
} else {
	document.addEventListener( 'DOMContentLoaded', init );
}
