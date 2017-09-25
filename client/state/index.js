/**
 * External dependencies
 */
import { createStore, applyMiddleware, compose } from 'redux';
import { reducer as form } from 'redux-form';
import thunkMiddleware from 'redux-thunk';

/**
 * Internal dependencies
 */
import accountRecovery from './account-recovery/reducer';
import activityLog from './activity-log/reducer';
import analyticsTracking from './analytics/reducer';
import application from './application/reducer';
import automatedTransfer from './automated-transfer/reducer';
import billingTransactions from './billing-transactions/reducer';
import comments from './comments/reducer';
import componentsUsageStats from './components-usage-stats/reducer';
import consoleDispatcher from './console-dispatch';
import countryStates from './country-states/reducer';
import currentUser from './current-user/reducer';
import documentHead from './document-head/reducer';
import domains from './domains/reducer';
import geo from './geo/reducer';
import googleAppsUsers from './google-apps-users/reducer';
import happinessEngineers from './happiness-engineers/reducer';
import happychat from './happychat/reducer';
import help from './help/reducer';
import jetpackConnect from './jetpack-connect/reducer';
import jetpackSync from './jetpack-sync/reducer';
import jetpack from './jetpack/reducer';
import login from './login/reducer';
import media from './media/reducer';
import noticesMiddleware from './notices/middleware';
import notices from './notices/reducer';
import npsSurvey from './nps-survey/reducer';
import oauth2Clients from './oauth2-clients/reducer';
import pageTemplates from './page-templates/reducer';
import plans from './plans/reducer';
import plugins from './plugins/reducer';
import postFormats from './post-formats/reducer';
import postTypes from './post-types/reducer';
import posts from './posts/reducer';
import preferences from './preferences/reducer';
import preview from './preview/reducer';
import productsList from './products-list/reducer';
import purchases from './purchases/reducer';
import pushNotifications from './push-notifications/reducer';
import reader from './reader/reducer';
import receipts from './receipts/reducer';
import sharing from './sharing/reducer';
import shortcodes from './shortcodes/reducer';
import signup from './signup/reducer';
import simplePayments from './simple-payments/reducer';
import siteRoles from './site-roles/reducer';
import siteSettings from './site-settings/reducer';
import sitesSync from './sites/enhancer';
import sites from './sites/reducer';
import stats from './stats/reducer';
import storedCards from './stored-cards/reducer';
import support from './support/reducer';
import terms from './terms/reducer';
import themes from './themes/reducer';
import timezones from './timezones/reducer';
import ui from './ui/reducer';
import userDevices from './user-devices/reducer';
import userSettings from './user-settings/reducer';
import users from './users/reducer';
import wordads from './wordads/reducer';
import config from 'config';
import extensionsModule from 'extensions';
import { combineReducers } from 'state/utils';

/**
 * Module variables
 */

// Consolidate the extension reducers under 'extensions' for namespacing.
const extensions = combineReducers( extensionsModule.reducers() );

const reducers = {
	analyticsTracking,
	accountRecovery,
	activityLog,
	application,
	automatedTransfer,
	billingTransactions,
	comments,
	componentsUsageStats,
	countryStates,
	currentUser,
	documentHead,
	domains,
	extensions,
	form,
	geo,
	googleAppsUsers,
	happinessEngineers,
	happychat,
	help,
	jetpackConnect,
	jetpack,
	jetpackSync,
	login,
	media,
	notices,
	npsSurvey,
	oauth2Clients,
	pageTemplates,
	plugins,
	plans,
	postFormats,
	posts,
	postTypes,
	preferences,
	preview,
	productsList,
	purchases,
	pushNotifications,
	reader,
	receipts,
	sharing,
	shortcodes,
	signup,
	sites,
	siteRoles,
	siteSettings,
	simplePayments,
	stats,
	storedCards,
	support,
	terms,
	timezones,
	themes,
	ui,
	users,
	userDevices,
	userSettings,
	wordads,
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
		isBrowser && require( './data-layer/extensions-middleware.js' ).default,
		noticesMiddleware,
		isBrowser && require( './happychat/middleware.js' ).default(),
		isBrowser && require( './analytics/middleware.js' ).analyticsMiddleware,
		isBrowser && require( './lib/middleware.js' ).default,
		isBrowser && config.isEnabled( 'restore-last-location' ) && require( './routing/middleware.js' ).default,
		isAudioSupported && require( './audio/middleware.js' ).default,
		isBrowser && config.isEnabled( 'automated-transfer' ) && require( './automated-transfer/middleware.js' ).default,
	].filter( Boolean );

	const enhancers = [
		isBrowser && window.app && window.app.isDebug && consoleDispatcher,
		applyMiddleware( ...middlewares ),
		isBrowser && sitesSync,
		isBrowser && window.devToolsExtension && window.devToolsExtension()
	].filter( Boolean );

	return compose( ...enhancers )( createStore )( reducer, initialState );
}
