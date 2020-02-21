/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';

/**
 * Internal dependencies
 */
import actionLog from 'state/ui/action-log/reducer';
import analyticsMiddleware from 'state/analytics/middleware';
import application from 'state/application/reducer';
import currentUser from 'state/current-user/reducer';
import documentHead from 'state/document-head/reducer';
import editor from 'state/ui/editor/reducer';
import guidedTour from 'state/ui/guided-tours/reducer';
import happychat from 'state/happychat/reducer';
import i18n from 'state/i18n/reducer';
import language from 'state/ui/language/reducer';
import layoutFocus from 'state/ui/layout-focus/reducer';
import libraryMiddleware from 'state/lib/middleware';
import login from 'state/login/reducer';
import masterbarVisibility from 'state/ui/masterbar-visibility/reducer';
import notices from 'state/notices/reducer';
import posts from 'state/posts/reducer';
import preferences from 'state/preferences/reducer';
import reader from 'state/ui/reader/reducer';
import route from 'state/ui/route/reducer';
import section from 'state/ui/section/reducer';
import sites from 'state/sites/reducer';
import users from 'state/users/reducer';
import userSettings from 'state/user-settings/reducer';
import wpcomApiMiddleware from 'state/data-layer/wpcom-api-middleware';
import { addReducerEnhancer } from 'state';
import { combineReducers } from 'state/utils';
import { isNotificationsOpen } from 'state/ui/reducer';
import { reducer as httpData, enhancer as httpDataEnhancer } from 'state/data-layer/http-data';
import { unseenCount as notificationsUnseenCount } from 'state/notifications';

// Legacy reducers
// The reducers in this list are not modularized, and are always loaded on boot.
const reducer = combineReducers( {
	application,
	currentUser,
	documentHead,
	happychat,
	httpData,
	i18n,
	login,
	notices,
	notificationsUnseenCount,
	posts,
	preferences,
	sites,
	ui: combineReducers( {
		actionLog,
		editor,
		guidedTour,
		isNotificationsOpen,
		language,
		layoutFocus,
		masterbarVisibility,
		reader,
		route,
		section,
	} ),
	users,
	userSettings,
} );

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () =>
	createStore(
		reducer,
		composeEnhancers(
			addReducerEnhancer,
			httpDataEnhancer,
			applyMiddleware( thunkMiddleware, wpcomApiMiddleware, analyticsMiddleware, libraryMiddleware )
		)
	);
