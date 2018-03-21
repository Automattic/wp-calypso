/** @format */

/**
 * External dependencies
 */

import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
// import the reducer directly from a submodule to prevent bundling the whole Redux Form
// library into the `build` chunk.
// TODO: change this back to `from 'redux-form'` after upgrade to Webpack 4.0 and a version
//       of Redux Form that uses the `sideEffects: false` flag
import form from 'redux-form/es/reducer';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import actionLogger from './action-log';
import activePromotions from './active-promotions/reducer';
import activityLog from './activity-log/reducer';
import analyticsTracking from './analytics/reducer';
import applicationPasswords from './application-passwords/reducer';
import navigationMiddleware from './navigation/middleware';
import noticesMiddleware from './notices/middleware';
import comments from './comments/reducer';
import currentUser from './current-user/reducer';
import documentHead from './document-head/reducer';
import domains from './domains/reducer';
import geo from './geo/reducer';
import googleAppsUsers from './google-apps-users/reducer';
import googleMyBusiness from './google-my-business/reducer';
import help from './help/reducer';
import i18n from './i18n/reducer';
import invites from './invites/reducer';
import inlineHelpSearchResults from './inline-help/reducer';
import jetpackConnect from './jetpack-connect/reducer';
import jetpack from './jetpack/reducer';
import jetpackRemoteInstall from './jetpack-remote-install/reducer';
import jetpackSync from './jetpack-sync/reducer';
import jitm from './jitm/reducer';
import happinessEngineers from './happiness-engineers/reducer';
import happychat from './happychat/reducer';
import login from './login/reducer';
import media from './media/reducer';
import notices from './notices/reducer';
import npsSurvey from './nps-survey/reducer';
import oauth2Clients from './oauth2-clients/reducer';
import orderTransactions from './order-transactions/reducer';
import pageTemplates from './page-templates/reducer';
import plans from './plans/reducer';
import plugins from './plugins/reducer';
import postFormats from './post-formats/reducer';
import posts from './posts/reducer';
import postTypes from './post-types/reducer';
import preferences from './preferences/reducer';
import privacyPolicy from './privacy-policy/reducer';
import productsList from './products-list/reducer';
import pushNotifications from './push-notifications/reducer';
import purchases from './purchases/reducer';
=======
import media from './media/reducer';
import notices from './notices/reducer';
import preferences from './preferences/reducer';
>>>>>>> Calypso: isolate Reader
import reader from './reader/reducer';
import support from './support/reducer';
import ui from './ui/reducer';
import users from './users/reducer';
import config from 'config';

/**
 * Module variables
 */

const reducers = {
	comments,
	currentUser,
	documentHead,
	form,
	media,
	notices,
	preferences,
	reader,
	ui,
	support,
	users,
};

export const reducer = combineReducers( reducers );

/**
 * @typedef {Object} ReduxStore
 * @property {!Function} dispatch dispatches actions
 * @property {!Function} getState returns the current state tree
 * @property {Function} replaceReducers replaces the state reducers
 * @property {Function} subscribe attaches an event listener to state changes
 */

export function createReduxStore( initialState = {} ) {
	const isBrowser = typeof window === 'object';
	const isAudioSupported = typeof window === 'object' && typeof window.Audio === 'function';

	const middlewares = [
		thunkMiddleware,
		// We need the data layer middleware to be used as early
		// as possible, before any side effects.
		// The data layer dispatches actions on network events
		// including success, failure, and progress updates
		// Its way of issuing these is to wrap the originating action
		// with special meta and dispatch it again each time.
		// If another middleware jumps in before the data layer
		// then it could mistakenly trigger on those network
		// responses. Therefore we need to inject the data layer
		// as early as possible into the middleware chain.
		require( './data-layer/wpcom-api-middleware.js' ).default,
		noticesMiddleware,
		isBrowser && require( './analytics/middleware.js' ).analyticsMiddleware,
		isBrowser && require( './lib/middleware.js' ).default,
		isBrowser &&
			config.isEnabled( 'restore-last-location' ) &&
			require( './routing/middleware.js' ).default,
		isAudioSupported && require( './audio/middleware.js' ).default,
		navigationMiddleware,
		isBrowser && require( './comments/middleware.js' ).default,
	].filter( Boolean );

	const enhancers = [
		applyMiddleware( ...middlewares ),
		isBrowser && window.devToolsExtension && window.devToolsExtension(),
	].filter( Boolean );

	return compose( ...enhancers )( createStore )( reducer, initialState );
}
