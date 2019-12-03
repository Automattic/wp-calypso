/**
 * External dependencies
 */
import { get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import {
	isCurrentPlanPaid,
	isJetpackSite,
	isJetpackMinimumVersion,
	getSite,
} from 'state/sites/selectors';
import { userCan } from 'lib/site/utils';

/**
 * Returns true if the Recurring Payments nudge should be visible in stats
 * Context: https://wordpress.com/read/blogs/122326716/posts/8496#comment-3782
 * It should be visible for sites that:
 * - are on a paid plan (feature availability)
 * - avarage more than a 1000 uniques per month
 *
 * This selector makes a point of not requesting any new data, so tries to reuse stats being already available in state tree
 * Sometimes they are not 100% accurate, but this is a nudge and it's good enough for our purposes.
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  siteId The Site ID
 * @returns {boolean} True if we should show the nudge
 */
export default function isRecurringPaymentsStatsNudgeVisible( state, siteId ) {
	if ( ! isCurrentPlanPaid( state, siteId ) ) {
		return false;
	}
	// We don't want to show notice if JP is too old
	if (
		isJetpackSite( state, siteId ) &&
		isJetpackMinimumVersion( state, siteId, '7.4' ) === false
	) {
		return false;
	}
	// We don't want to show the notice to the user that can't use recurring payments
	if ( ! userCan( 'manage_options', getSite( state, siteId ) ) ) {
		return false;
	}

	// Now let's try to calculate monthly uniques.
	const dayStats = get( state, [ 'stats', 'chartTabs', 'counts', siteId, 'day' ] );
	const monthStats = get( state, [ 'stats', 'chartTabs', 'counts', siteId, 'month' ] );
	const yearStats = get( state, [ 'stats', 'chartTabs', 'counts', siteId, 'year' ] );
	const weekStats = get( state, [ 'stats', 'chartTabs', 'counts', siteId, 'week' ] );
	let monthlyVisitors = 0;
	if ( isArray( dayStats ) ) {
		// Last 30 days of stats
		monthlyVisitors = dayStats.slice( -30 ).reduce( function( total, curr ) {
			return total + curr.views;
		}, 0 );
	} else if ( isArray( monthStats ) ) {
		// We want the stats from the previous month, not this one.
		monthlyVisitors = get( monthStats.slice( -2 ), [ 0, 'views' ], 0 );
	} else if ( isArray( weekStats ) ) {
		// Last 4 weeks
		monthlyVisitors = weekStats.slice( -4 ).reduce( function( total, curr ) {
			return total + curr.views;
		}, 0 );
	} else if ( isArray( yearStats ) ) {
		monthlyVisitors = get( yearStats.slice( -1 ), [ 0, 'views' ], 0 ) / 12;
	}

	return monthlyVisitors > 1000;
}
