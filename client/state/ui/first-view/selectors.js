/** @ssr-ready **/

/**
 * External dependencies
 */
import filter from 'lodash/filter';
import some from 'lodash/some';
import startsWith from 'lodash/startsWith';
import takeRightWhile from 'lodash/takeRightWhile';

/**
 * Internal dependencies
 */
import { FIRST_VIEW_START_DATES } from './constants';
import { getActionLog } from 'state/ui/action-log/selectors';
import { getPreference } from 'state/preferences/selectors';
import { getSectionName, isSectionLoading } from 'state/ui/selectors';
import { isEnabled } from 'config';
import { ROUTE_SET } from 'state/action-types';

export function doesViewHaveFirstView( view ) {
	return !! ( FIRST_VIEW_START_DATES[ view ] );
}

export function isViewEnabled( state, view ) {
	if ( isLikelyInSafariPrivateMode() ) {
		// Don't enable the view in Safari Private Mode... otherwise, Safari will flash the
		// First View in Private Mode until it has loaded the preferences from the
		// server (and we are also currently not reading the preferences from the server)
		// even if the user has disabled it, since it doesn't have any local
		// cache of the preferences (since IndexedDB is not available in Private Mode)
		return false;
	}

	const firstViewHistory = getPreference( state, 'firstViewHistory' ).filter( entry => entry.view === view );
	const latestFirstViewHistory = [ ...firstViewHistory ].pop();
	const isViewDisabled = latestFirstViewHistory ? ( !! latestFirstViewHistory.disabled ) : false;
	return doesViewHaveFirstView( view ) && ! isViewDisabled;
}

export function wasViewHidden( state, view ) {
	return -1 !== state.ui.firstView.hidden.indexOf( view );
}

export function switchedFromDifferentSection( state ) {
	const section = state.ui.section;
	const routeSets = filter( getActionLog( state ), { type: ROUTE_SET } );
	const lastRouteSetsForSection = takeRightWhile( routeSets,
		routeSet => some( section.paths, path => startsWith( routeSet.path, path ) ) );
	return lastRouteSetsForSection.length === 1;
}

export function shouldViewBeVisible( state ) {
	const sectionName = getSectionName( state );

	return isEnabled( 'ui/first-view' ) &&
		isViewEnabled( state, sectionName ) &&
		! wasViewHidden( state, sectionName ) &&
		switchedFromDifferentSection( state ) &&
		! isSectionLoading( state );
}

function isLikelyInSafariPrivateMode() {
	// Safari doesn't allow access to Local Storage when in Private Mode;
	// We will use this check as a proxy to determine whether or not Safari
	// is in Private Mode
	let isAbleToAccessLocalStorage = true;

	try {
		localStorage.checkIfFirstViewPreferencesCanBeCached = null;
	} catch ( ex ) {
		isAbleToAccessLocalStorage = false;
	}

	return ! isAbleToAccessLocalStorage;
}
