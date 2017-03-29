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
import config from 'config';

const debug = debugFactory( 'calypso:state:reducers' );

/**
 * Module variables
 */

export const initialReducers = {
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

/**
 * Create a default set of middleware/enhancers.
 *
 * The enhancers included depend on the runtime environment of this code.
 *
 * @return { array } The array of enhancers to be configured in a redux store.
 */
export function createEnhancers() {
	const isBrowser = typeof window === 'object';
	const isAudioSupported = typeof window === 'object' && typeof window.Audio === 'function';

	const middlewares = [
		thunkMiddleware,
		noticesMiddleware,
		isBrowser && require( './happychat/middleware.js' ).default(),
		isBrowser && require( './analytics/middleware.js' ).analyticsMiddleware,
		isBrowser && require( './data-layer/wpcom-api-middleware.js' ).default,
		isAudioSupported && require( './audio/middleware.js' ).default,
		isBrowser && config.isEnabled( 'automated-transfer' ) && require( './automated-transfer/middleware.js' ).default,
	].filter( Boolean );

	const enhancers = [
		isBrowser && window.app && window.app.isDebug && consoleDispatcher,
		applyMiddleware( ...middlewares ),
		isBrowser && sitesSync,
		isBrowser && window.devToolsExtension && window.devToolsExtension()
	].filter( Boolean );

	return enhancers;
}

/**
 * Creates a new redux store with the ability to add/remove reducers dynamically.
 *
 * @param { object } initialState Redux state with which to initialize (optional).
 * @param { array } startingReducers Initial list of reducers to start with.
 * @param { array } enhancers Assembled list of enhancers for the store.
 * @return { object } The redux store that was created.
 */
export function createReduxStore( initialState, startingReducers = initialReducers, enhancers = createEnhancers() ) {
	// This creates a normal redux store, but it adds our list of original reducers.
	// This is so we can modify that list of reducers later on and regenerate it.
	const reduxStore = compose( ...enhancers )( createStore )( combineReducers( startingReducers ), initialState );
	reduxStore.reducers = startingReducers;

	/**
	 * Adds a reducer dynamically to the store.
	 *
	 * @param { string } name The top-level context name for the reducer.
	 * @param { function } func The reducer function, in the format of ( state, action ), returning state.
	 */
	function addReducer( name, func ) {
		if ( reduxStore.reducers[ name ] !== undefined ) {
			throw new Error( `addReducer(): Reducer by name "${ name }" already in use` );
		}
		const newReducerList = { ...reduxStore.reducers, [ name ]: func };

		reduxStore.replaceReducer( combineReducers( newReducerList ) );
		reduxStore.reducers = newReducerList;
	}

	/**
	 * Removes a reducer dynamically from the store.
	 *
	 * @param { string } name The top-level context name for the reducer.
	 */
	function removeReducer( name ) {
		const { [ name ]: removedReducer, ...remainingReducers } = reduxStore.reducers;

		if ( ! removedReducer ) {
			debug( `removeReducer(): Reducer not found by name "${ name }".` );
			return;
		}

		reduxStore.replaceReducer( combineReducers( remainingReducers ) );
		reduxStore.reducers = remainingReducers;
	}

	/**
	 * Gets the current list of reducers.
	 *
	 * @return { object } The mapping of top-level reducers that are running within the store.
	 */
	function getReducers() {
		return reduxStore.reducers;
	}

	// Here we return a wrapped redux store.
	// We omit `replaceReducer` and add `addReducer`, `removeReducer` and `getReducers`.
	const { replaceReducer, reducers, ...reduxStoreInterface } = reduxStore; // eslint-disable-line no-unused-vars

	return {
		...reduxStoreInterface,
		addReducer,
		removeReducer,
		getReducers,
	};
}

