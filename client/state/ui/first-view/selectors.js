/** @ssr-ready **/

/**
 * External dependencies
 */
import filter from 'lodash/filter';
import last from 'lodash/last';
import moment from 'moment';
import some from 'lodash/some';
import startsWith from 'lodash/startsWith';
import takeRightWhile from 'lodash/takeRightWhile';

/**
 * Internal dependencies
 */
import { FIRST_VIEW_CONFIG } from './constants';
import { getActionLog } from 'state/ui/action-log/selectors';
import { getPreference, preferencesLastFetchedTimestamp } from 'state/preferences/selectors';
import { isSectionLoading, getInitialQueryArguments } from 'state/ui/selectors';
import { FIRST_VIEW_HIDE, ROUTE_SET } from 'state/action-types';
import { getCurrentUserDate } from 'state/current-user/selectors';

export function getConfigForCurrentView( state ) {
	const currentRoute = last( filter( getActionLog( state ), { type: ROUTE_SET } ) );
	const path = currentRoute.path ? currentRoute.path : '';
	const config = FIRST_VIEW_CONFIG.filter( entry => some( entry.paths, entryPath => startsWith( path, entryPath ) ) );

	return config.pop() || false;
}

export function isUserEligible( state, config ) {
	const userStartDate = getCurrentUserDate( state );

	// If no start date is defined, all users are eligible
	if ( ! config.startDate ) {
		return true;
	}

	// If the user doesn't have a start date, we don't want to show the first view
	if ( ! userStartDate ) {
		return false;
	}

	return moment( userStartDate ).isAfter( config.startDate );
}

export function isQueryStringEnabled( state, config ) {
	const queryArguments = getInitialQueryArguments( state );
	return queryArguments.firstView === config.name;
}

export function isViewEnabled( state, config ) {
	// in order to avoid using an out-of-date preference for whether a
	// FV should be enabled or not, wait until we have fetched the
	// preferences from the API
	if ( ! preferencesLastFetchedTimestamp( state ) ) {
		return false;
	}

	const firstViewHistory = getPreference( state, 'firstViewHistory' ).filter( entry => entry.view === config.name );
	const latestFirstViewHistory = [ ...firstViewHistory ].pop();
	const isViewDisabled = latestFirstViewHistory ? ( !! latestFirstViewHistory.disabled ) : false;

	// If the view is disabled, we want to return false, regardless of state
	if ( isViewDisabled ) {
		return false;
	}

	return isQueryStringEnabled( state, config ) || ( config.enabled && isUserEligible( state, config ) );
}

export function wasFirstViewHiddenSinceEnteringCurrentSection( state, config ) {
	const actionsSinceEnteringCurrentSection = takeRightWhile( getActionLog( state ), ( action ) => {
		return ( action.type !== ROUTE_SET ) || ( action.type === ROUTE_SET && routeSetIsInCurrentSection( state, action ) );
	} );

	return some( actionsSinceEnteringCurrentSection,
		action => action.type === FIRST_VIEW_HIDE && action.view === config.name );
}

function routeSetIsInCurrentSection( state, routeSet ) {
	const section = state.ui.section;
	return some( section.paths, path => startsWith( routeSet.path, path ) );
}

export function shouldViewBeVisible( state ) {
	const firstViewConfig = getConfigForCurrentView( state );

	if ( ! firstViewConfig ) {
		return false;
	}

	return isViewEnabled( state, firstViewConfig ) &&
		! wasFirstViewHiddenSinceEnteringCurrentSection( state, firstViewConfig ) &&
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
