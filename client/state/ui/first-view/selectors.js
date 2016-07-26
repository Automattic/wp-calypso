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
import { getPreference, preferencesLastFetchedTimestamp } from 'state/preferences/selectors';
import { getSectionName, isSectionLoading } from 'state/ui/selectors';
import { FIRST_VIEW_HIDE, ROUTE_SET } from 'state/action-types';

export function doesViewHaveFirstView( view ) {
	return !! ( FIRST_VIEW_START_DATES[ view ] );
}

export function isViewEnabled( state, view ) {
	// in order to avoid using an out-of-date preference for whether a
	// FV should be enabled or not, wait until we have fetched the
	// preferences from the API
	if ( ! preferencesLastFetchedTimestamp( state ) ) {
		return false;
	}

	const firstViewHistory = getPreference( state, 'firstViewHistory' ).filter( entry => entry.view === view );
	const latestFirstViewHistory = [ ...firstViewHistory ].pop();
	const isViewDisabled = latestFirstViewHistory ? ( !! latestFirstViewHistory.disabled ) : false;
	return doesViewHaveFirstView( view ) && ! isViewDisabled;
}

export function wasFirstViewHiddenSinceEnteringCurrentSection( state ) {
	const sectionName = getSectionName( state );
	const actionsSinceEnteringCurrentSection = takeRightWhile( getActionLog( state ), ( action ) => {
		return ( action.type !== ROUTE_SET ) || ( action.type === ROUTE_SET && routeSetIsInCurrentSection( state, action ) );
	} );

	return some( actionsSinceEnteringCurrentSection,
		action => action.type === FIRST_VIEW_HIDE && action.view === sectionName );
}

function routeSetIsInCurrentSection( state, routeSet ) {
	const section = state.ui.section;
	return some( section.paths, path => startsWith( routeSet.path, path ) );
}

export function shouldViewBeVisible( state ) {
	const sectionName = getSectionName( state );

	return isViewEnabled( state, sectionName ) &&
		! wasFirstViewHiddenSinceEnteringCurrentSection( state ) &&
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
