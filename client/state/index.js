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

/**
 * Creates and holds the Redux Store and its dependencies.
 * @param { object } reducers: The named set of reducers for the store.
 */
export class CalypsoStore {
	constructor() {
		this.reducers = { ...initialReducers };
		this.reduxStore = null;
	}

	createReduxStore( initialState = {} ) {
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

		const reducer = this.getCombinedReducer();
		this.reduxStore = compose( ...enhancers )( createStore )( reducer, initialState );
		return this.reduxStore;
	}

	addReducer( name, reducerFunc ) {
		if ( this.reducers[ name ] !== undefined ) {
			throw new Error( `addReducer(): name ${ name } already in use` );
		}

		this.setReducers( { ...this.reducers, [ name ]: reducerFunc } );
	}

	removeReducer( name ) {
		const { [ name ]: removedReducer, ...remainingReducers } = this.reducers;

		if ( ! removedReducer ) {
			debug( 'removeReducer(): name not found' );
			return;
		}

		this.setReducers( remainingReducers );
	}

	getCombinedReducer() {
		const reducers = this.reducers;
		return combineReducers( reducers );
	}

	setReducers( reducers ) {
		this.reducers = reducers;

		if ( this.reduxStore ) {
			this.reduxStore.replaceReducer( this.getCombinedReducer() );
		}
	}
}

const calypsoStore = new CalypsoStore();

/**
 * Named export function for creating a redux store.
 * This creates a new redux store within the calypsoStore instance.
 *
 * @param { object } initialState Redux state with which to initialize (optional).
 * @return { object } The redux store that was created.
 */
export function createReduxStore( initialState ) {
	return calypsoStore.createReduxStore( initialState );
}

/**
 * Named export for adding a reducer dynamically to the store.
 *
 * @param { string } name The top-level context name for the reducer.
 * @param { function } func The reducer function, in the format of ( state, action ), returning state.
 */
export function addReducer( name, func ) {
	calypsoStore.addReducer( name, func );
}

/**
 * Named export for adding a reducer dynamically to the store.
 *
 * @param { string } name The top-level context name for the reducer.
 */
export function removeReducer( name ) {
	calypsoStore.removeReducer( name );
}

/**
 * Named export for getting the combined reducer from the store.
 *
 * @return { function } The currently configured reducer chain.
 */
export function getCombinedReducer() {
	return calypsoStore.getCombinedReducer();
}

