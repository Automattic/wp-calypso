/**
 * External dependencies
 */
import debugFactory from 'debug';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import analytics from 'lib/analytics';
import cartStore from 'lib/cart/store';
import keyboardShortcuts from 'lib/keyboard-shortcuts';
import sitesFactory from 'lib/sites-list';
import { ANALYTICS_SUPER_PROPS_UPDATE, NOTIFICATIONS_PANEL_TOGGLE, SELECTED_SITE_SET, SITE_RECEIVE, SITES_RECEIVE, SITES_UPDATE, SITES_ONCE_CHANGED, SELECTED_SITE_SUBSCRIBE, SELECTED_SITE_UNSUBSCRIBE } from 'state/action-types';
import { getCurrentUser } from 'state/current-user/selectors';
import { isNotificationsOpen } from 'state/selectors';
import { getSelectedSite } from 'state/ui/selectors';
const sites = sitesFactory();

const debug = debugFactory( 'calypso:state:middleware' );

/**
 * Module variables
 */
const globalKeyBoardShortcutsEnabled = config.isEnabled( 'keyboard-shortcuts' );
let globalKeyboardShortcuts;

if ( globalKeyBoardShortcutsEnabled ) {
	globalKeyboardShortcuts = require( 'lib/keyboard-shortcuts/global' )();
}

const desktopEnabled = config.isEnabled( 'desktop' );
let desktop;
if ( desktopEnabled ) {
	desktop = require( 'lib/desktop' );
}

/*
 * Object holding functions that will be called once selected site changes.
 */
let selectedSiteChangeListeners = [];

/**
 * Calls the listeners to selected site.
 *
 * @param {function} dispatch - redux dispatch function
 * @param {number} siteId     - the selected site id
 */
const updateSelectedSiteIdForSubscribers = ( dispatch, { siteId } ) => {
	selectedSiteChangeListeners.forEach( listener => listener( siteId ) );
};

/**
 * Registers a listener function to be fired once selected site changes.
 *
 * @param {function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 */
const receiveSelectedSitesChangeListener = ( dispatch, action ) => {
	debug( 'receiveSelectedSitesChangeListener' );
	selectedSiteChangeListeners.push( action.listener );
};

/**
 * Removes a selectedSite listener.
 *
 * @param {function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 */
const removeSelectedSitesChangeListener = ( dispatch, action ) => {
	debug( 'removeSelectedSitesChangeListener' );
	selectedSiteChangeListeners = selectedSiteChangeListeners.filter( listener => listener !== action.listener );
};

/*
 * Queue of functions waiting to be called once (and only once) when sites data
 * arrives (SITES_RECEIVE). Aims to reduce dependencies on ´lib/sites-list` by
 * providing an alternative to `sites.once()`.
 */
let sitesListeners = [];

/**
 * Sets the selected site id for SitesList
 *
 * @param {function} dispatch - redux dispatch function
 * @param {number} siteId     - the selected site id
 */
const updateSelectedSiteIdForSitesList = ( dispatch, { siteId } ) => {
	if ( siteId ) {
		sites.select( siteId );
	} else {
		sites.selectAll();
	}
};

/**
 * Sets the selectedSite and siteCount for lib/analytics. This is used to
 * populate extra fields on tracks analytics calls.
 *
 * @param {function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {function} getState - redux getState function
 */
const updateSelectedSiteForAnalytics = ( dispatch, action, getState ) => {
	const state = getState();
	const selectedSite = getSelectedSite( state );
	const user = getCurrentUser( state );
	const siteCount = get( user, 'site_count', 0 );
	analytics.setSelectedSite( selectedSite );
	analytics.setSiteCount( siteCount );
};

/**
 * Sets the selectedSiteId for lib/cart/store
 *
 * @param {function} dispatch - redux dispatch function
 * @param {number}   siteId   - the selected siteId
 */
const updateSelectedSiteForCart = ( dispatch, { siteId } ) => {
	cartStore.setSelectedSiteId( siteId );
};

/**
 * Sets the selectedSite for lib/keyboard-shortcuts/global
 *
 * @param {function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {function} getState - redux getState function
 */
const updatedSelectedSiteForKeyboardShortcuts = ( dispatch, action, getState ) => {
	const state = getState();
	const selectedSite = getSelectedSite( state );
	globalKeyboardShortcuts.setSelectedSite( selectedSite );
};

/**
 * Sets isNotificationOpen for lib/keyboard-shortcuts
 *
 * @param {function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {function} getState - redux getState function
 */
const updateNotificationsOpenForKeyboardShortcuts = ( dispatch, action, getState ) => {
	// flip the state here, since the reducer hasn't had a chance to update yet
	const toggledState = ! isNotificationsOpen( getState() );
	keyboardShortcuts.setNotificationsOpen( toggledState );
};

/**
 * Sets the selected site for lib/desktop
 *
 * @param {function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 * @param {function} getState - redux getState function
 */
const updateSelectedSiteForDesktop = ( dispatch, action, getState ) => {
	const state = getState();
	const selectedSite = getSelectedSite( state );
	desktop.setSelectedSite( selectedSite );
};

/**
 * Registers a listener function to be fired once there are changes to sites
 * state.
 *
 * @param {function} dispatch - redux dispatch function
 * @param {object}   action   - the dispatched action
 */
const receiveSitesChangeListener = ( dispatch, action ) => {
	debug( 'receiveSitesChangeListener' );
	sitesListeners.push( action.listener );
};

/**
 * Calls all functions registered as listeners of site-state changes.
 */
const fireChangeListeners = () => {
	debug( 'firing', sitesListeners.length, 'emitters' );
	sitesListeners.forEach( ( listener ) => listener() );
	sitesListeners = [];
};

const handler = ( dispatch, action, getState ) => {
	switch ( action.type ) {
		case ANALYTICS_SUPER_PROPS_UPDATE:
			return updateSelectedSiteForAnalytics( dispatch, action, getState );

		//when the notifications panel is open keyboard events should not fire.
		case NOTIFICATIONS_PANEL_TOGGLE:
			return updateNotificationsOpenForKeyboardShortcuts( dispatch, action, getState );

		case SELECTED_SITE_SET:
			//let this fall through
			updateSelectedSiteIdForSitesList( dispatch, action );
			updateSelectedSiteForCart( dispatch, action );
			updateSelectedSiteIdForSubscribers( dispatch, action );

		case SITE_RECEIVE:
		case SITES_RECEIVE:
		case SITES_UPDATE:
			// Wait a tick for the reducer to update the state tree
			setTimeout( () => {
				if ( action.type === SITES_RECEIVE ) {
					fireChangeListeners();
				}
				if ( globalKeyBoardShortcutsEnabled ) {
					updatedSelectedSiteForKeyboardShortcuts( dispatch, action, getState );
				}
				if ( desktopEnabled ) {
					updateSelectedSiteForDesktop( dispatch, action, getState );
				}
			}, 0 );
			return;

		case SITES_ONCE_CHANGED:
			receiveSitesChangeListener( dispatch, action );
			return;
		case SELECTED_SITE_SUBSCRIBE:
			receiveSelectedSitesChangeListener( dispatch, action );
			return;
		case SELECTED_SITE_UNSUBSCRIBE:
			removeSelectedSitesChangeListener( dispatch, action );
			return;
	}
};

export const libraryMiddleware = ( { dispatch, getState } ) => ( next ) => ( action ) => {
	handler( dispatch, action, getState );

	return next( action );
};

export default libraryMiddleware;
