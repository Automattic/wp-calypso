/** @format */
/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import { reducer as form } from 'redux-form';
import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import extensionsModule from 'extensions';
import { combineReducers } from 'state/utils';

/**
 * Store enhancers
 */
import actionLogger from './action-log';
import consoleDispatcher from './console-dispatch';
import { enhancer as httpDataEnhancer, reducer as httpData } from 'state/data-layer/http-data';

/**
 * Redux middleware
 */
import navigationMiddleware from './navigation/middleware';
import noticesMiddleware from './notices/middleware';
import wpcomApiMiddleware from 'state/data-layer/wpcom-api-middleware';

/**
 * Reducers
 */
import account from './account/reducer';
import accountRecovery from './account-recovery/reducer';
import activePromotions from './active-promotions/reducer';
import activityLog from './activity-log/reducer';
import analyticsTracking from './analytics/reducer';
import application from './application/reducer';
import applicationPasswords from './application-passwords/reducer';
import automatedTransfer from './automated-transfer/reducer';
import billingTransactions from './billing-transactions/reducer';
import checklist from './checklist/reducer';
import comments from './comments/reducer';
import componentsUsageStats from './components-usage-stats/reducer';
import concierge from './concierge/reducer';
import connectedApplications from './connected-applications/reducer';
import countries from './countries/reducer';
import countryStates from './country-states/reducer';
import currentUser from './current-user/reducer';
import { reducer as dataRequests } from './data-layer/wpcom-http/utils';
import documentHead from './document-head/reducer';
import domains from './domains/reducer';
import googleAppsUsers from './google-apps-users/reducer';
import googleMyBusiness from './google-my-business/reducer';
import happinessEngineers from './happiness-engineers/reducer';
import happychat from './happychat/reducer';
import help from './help/reducer';
import i18n from './i18n/reducer';
import immediateLogin from './immediate-login/reducer';
import importerNux from './importer-nux/reducer';
import inlineHelpSearchResults from './inline-help/reducer';
import inlineSupportArticle from './inline-support-article/reducer';
import invites from './invites/reducer';
import jetpack from './jetpack/reducer';
import jetpackConnect from './jetpack-connect/reducer';
import jetpackRemoteInstall from './jetpack-remote-install/reducer';
import jetpackSync from './jetpack-sync/reducer';
import jitm from './jitm/reducer';
import login from './login/reducer';
import media from './media/reducer';
import memberships from './memberships/reducer';
import mailchimp from './mailchimp/reducer';
import notices from './notices/reducer';
import { unseenCount as notificationsUnseenCount } from './notifications';
import npsSurvey from './nps-survey/reducer';
import oauth2Clients from './oauth2-clients/reducer';
import orderTransactions from './order-transactions/reducer';
import pageTemplates from './page-templates/reducer';
import plans from './plans/reducer';
import plugins from './plugins/reducer';
import postFormats from './post-formats/reducer';
import postTypes from './post-types/reducer';
import posts from './posts/reducer';
import preferences from './preferences/reducer';
import productsList from './products-list/reducer';
import purchases from './purchases/reducer';
import pushNotifications from './push-notifications/reducer';
import reader from './reader/reducer';
import receipts from './receipts/reducer';
import { rewindReducer as rewind } from './rewind';
import sharing from './sharing/reducer';
import shortcodes from './shortcodes/reducer';
import signup from './signup/reducer';
import simplePayments from './simple-payments/reducer';
import siteAddressChange from './site-address-change/reducer';
import siteKeyrings from './site-keyrings/reducer';
import siteRoles from './site-roles/reducer';
import siteSettings from './site-settings/reducer';
import sites from './sites/reducer';
import stats from './stats/reducer';
import storedCards from './stored-cards/reducer';
import support from './support/reducer';
import terms from './terms/reducer';
import themes from './themes/reducer';
import timezones from './timezones/reducer';
import ui from './ui/reducer';
import userDevices from './user-devices/reducer';
import userProfileLinks from './profile-links/reducer';
import userSettings from './user-settings/reducer';
import users from './users/reducer';
import wordads from './wordads/reducer';

/**
 * Module variables
 */

// Consolidate the extension reducers under 'extensions' for namespacing.
const extensions = combineReducers(
	mapValues(
		extensionsModule.reducers(),
		reducer => ( reducer.default ? reducer.default : reducer )
	)
);

const reducers = {
	account,
	accountRecovery,
	activePromotions,
	activityLog,
	analyticsTracking,
	application,
	applicationPasswords,
	automatedTransfer,
	billingTransactions,
	checklist,
	comments,
	componentsUsageStats,
	concierge,
	connectedApplications,
	countries,
	countryStates,
	currentUser,
	dataRequests,
	documentHead,
	domains,
	extensions,
	form,
	googleAppsUsers,
	googleMyBusiness,
	happinessEngineers,
	happychat,
	help,
	httpData,
	i18n,
	immediateLogin,
	importerNux,
	inlineHelpSearchResults,
	inlineSupportArticle,
	invites,
	jetpack,
	jetpackConnect,
	jetpackRemoteInstall,
	jetpackSync,
	jitm,
	login,
	media,
	notices,
	notificationsUnseenCount,
	npsSurvey,
	oauth2Clients,
	orderTransactions,
	pageTemplates,
	plans,
	plugins,
	postFormats,
	postTypes,
	posts,
	preferences,
	productsList,
	purchases,
	pushNotifications,
	reader,
	receipts,
	rewind,
	sharing,
	shortcodes,
	signup,
	simplePayments,
	siteAddressChange,
	siteKeyrings,
	siteRoles,
	siteSettings,
	sites,
	stats,
	storedCards,
	support,
	terms,
	themes,
	timezones,
	ui,
	userDevices,
	userProfileLinks,
	userSettings,
	users,
	wordads,
};

if ( config.isEnabled( 'memberships' ) ) {
	reducers.memberships = memberships;
}
if ( config.isEnabled( 'mailchimp' ) ) {
	reducers.mailchimp = mailchimp;
}

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
		wpcomApiMiddleware,
		noticesMiddleware,
		isBrowser && require( './happychat/middleware.js' ).default,
		isBrowser && require( './happychat/middleware-calypso.js' ).default,
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
		isBrowser && window.app && window.app.isDebug && consoleDispatcher,
		httpDataEnhancer,
		applyMiddleware( ...middlewares ),
		isBrowser && window.app && window.app.isDebug && actionLogger,
		isBrowser && window.devToolsExtension && window.devToolsExtension(),
	].filter( Boolean );

	return compose( ...enhancers )( createStore )( reducer, initialState );
}
