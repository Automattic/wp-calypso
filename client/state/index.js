/**
 * External dependencies
 */
import debugFactory from 'debug';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';

/**
 * Internal dependencies
 */
import sitesSync from './sites/enhancer';
import noticesMiddleware from './notices/middleware';
import application from './application/reducer';
import accountRecovery from './account-recovery/reducer';
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
import help from './help/reducer';
import jetpackConnect from './jetpack-connect/reducer';
import jetpack from './jetpack/reducer';
import jetpackSync from './jetpack-sync/reducer';
import happinessEngineers from './happiness-engineers/reducer';
import happychat from './happychat/reducer';
import media from './media/reducer';
import notices from './notices/reducer';
import pageTemplates from './page-templates/reducer';
import plans from './plans/reducer';
import plugins from './plugins/reducer';
import postFormats from './post-formats/reducer';
import posts from './posts/reducer';
import postTypes from './post-types/reducer';
import preferences from './preferences/reducer';
import preview from './preview/reducer';
import productsList from './products-list/reducer';
import pushNotifications from './push-notifications/reducer';
import purchases from './purchases/reducer';
import reader from './reader/reducer';
import receipts from './receipts/reducer';
import sharing from './sharing/reducer';
import shortcodes from './shortcodes/reducer';
import signup from './signup/reducer';
import sites from './sites/reducer';
import siteRoles from './site-roles/reducer';
import siteSettings from './site-settings/reducer';
import stats from './stats/reducer';
import storedCards from './stored-cards/reducer';
import support from './support/reducer';
import terms from './terms/reducer';
import timezones from './timezones/reducer';
import themes from './themes/reducer';
import ui from './ui/reducer';
import users from './users/reducer';
import wordads from './wordads/reducer';

const debug = debugFactory( 'calypso:state:reducers' );

/**
 * Module variables
 */
const initialReducers = {
	application,
	accountRecovery,
	automatedTransfer,
	billingTransactions,
	comments,
	componentsUsageStats,
	countryStates,
	currentUser,
	documentHead,
	domains,
	geo,
	googleAppsUsers,
	happinessEngineers,
	happychat,
	help,
	jetpackConnect,
	jetpack,
	jetpackSync,
	media,
	notices,
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
	stats,
	storedCards,
	support,
	terms,
	timezones,
	themes,
	ui,
	users,
	wordads,
};

// TODO: This is temporary just to make the tests run until I refactor this.
export let reducers = { ...initialReducers };
let onChange = null;

// TODO: See if this export can be eliminated.
export let reducer = combineReducers( reducers );

export function addReducer( name, reducerFunc ) {
	if ( reducers[ name ] !== undefined ) {
		throw new Error( `addReducer(): name ${ name } already in use` );
	}

	reducers = { ...reducers, [ name ]: reducerFunc };

	if ( onChange ) {
		onChange();
	}
}

export function removeReducer( name ) {
	const { [ name ]: removedReducer, ...remainingReducers } = reducers;

	if ( ! removedReducer ) {
		debug( 'removeReducer(): name not found' );
		return;
	}

	reducers = remainingReducers;
}

export function createReduxStore( initialState = {} ) {
	const isBrowser = typeof window === 'object';
	const isAudioSupported = typeof window === 'object' && typeof window.Audio === 'function';

	const middlewares = [
		thunkMiddleware,
		noticesMiddleware,
		isBrowser && require( './analytics/middleware.js' ).analyticsMiddleware,
		isBrowser && require( './data-layer/wpcom-api-middleware.js' ).default,
		isAudioSupported && require( './audio/middleware.js' ).default,
	].filter( Boolean );

	const enhancers = [
		isBrowser && window.app && window.app.isDebug && consoleDispatcher,
		applyMiddleware( ...middlewares ),
		isBrowser && sitesSync,
		isBrowser && window.devToolsExtension && window.devToolsExtension()
	].filter( Boolean );

	const store = compose( ...enhancers )( createStore )( reducer, initialState );

	onChange = () => {
		reducer = combineReducers( reducers );
		store.replaceReducer( reducer );
	};

	return store;
}

