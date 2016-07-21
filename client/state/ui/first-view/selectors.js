/** @ssr-ready **/

/**
 * External dependencies
 */
import filter from 'lodash/filter';
import last from 'lodash/last';
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

export function secondsSpentOnCurrentView( state, now = Date.now() ) {
	const routeSets = filter( getActionLog( state ), { type: ROUTE_SET } );
	const currentRoute = last( routeSets );
	return currentRoute ? ( now - currentRoute.timestamp ) / 1000 : -1;
}

export function bucketedTimeSpentOnCurrentView( state, now = Date.now() ) {
	const timeSpent = secondsSpentOnCurrentView( state, now );

	if ( -1 === timeSpent ) {
		return 'unknown';
	}

	if ( timeSpent < 2 ) {
		return 'under2';
	}

	if ( timeSpent < 5 ) {
		return '2-5';
	}

	if ( timeSpent < 10 ) {
		return '5-10';
	}

	if ( timeSpent < 20 ) {
		return '10-20';
	}

	if ( timeSpent < 60 ) {
		return '20-60';
	}

	return '60plus';
}
