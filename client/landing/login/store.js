/**
 * External dependencies
 */
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';

/**
 * Internal dependencies
 */
import wpcomApiMiddleware from 'state/data-layer/wpcom-api-middleware';
import analyticsMiddleware from 'state/analytics/middleware';
import { reducer as httpData, enhancer as httpDataEnhancer } from 'state/data-layer/http-data';
import { combineReducers, addReducerEnhancer } from 'state/utils';
import application from 'state/application/reducer';
import documentHead from 'state/document-head/reducer';
import language from 'state/ui/language/reducer';
import route from 'state/ui/route/reducer';
import masterbarVisibility from 'state/ui/masterbar-visibility/reducer';
import oauth2ClientsUI from 'state/ui/oauth2-clients/reducer';
import section from 'state/ui/section/reducer';
import notices from 'state/notices/reducer';
import i18n from 'state/i18n/reducer';
import users from 'state/users/reducer';
import currentUser from 'state/current-user/reducer';
import preferences from 'state/preferences/reducer';
import oauth2Clients from 'state/oauth2-clients/reducer';

// Legacy reducers
// The reducers in this list are not modularized, and are always loaded on boot.
const rootReducer = combineReducers( {
	application,
	documentHead,
	httpData,
	notices,
	i18n,
	users,
	currentUser,
	preferences,
	oauth2Clients,
	ui: combineReducers( {
		language,
		route,
		masterbarVisibility,
		oauth2Clients: oauth2ClientsUI,
		section,
	} ),
} );

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () =>
	createStore(
		rootReducer,
		composeEnhancers(
			addReducerEnhancer,
			httpDataEnhancer,
			applyMiddleware( thunkMiddleware, wpcomApiMiddleware, analyticsMiddleware )
		)
	);
