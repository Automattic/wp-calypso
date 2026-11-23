import {
	STATS_FEATURE_DATE_CONTROL_LAST_12_MONTHS,
	STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_7_DAYS,
	STATS_FEATURE_SUMMARY_LINKS_QUARTER,
} from 'calypso/my-sites/stats/constants';
import { shouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import { statTypeToPlan } from 'calypso/my-sites/stats/stat-type-to-plan';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	DATE_RANGE_LAST_12_MONTHS,
	DATE_RANGE_LAST_30_DAYS,
	DATE_RANGE_LAST_7_DAYS,
	DATE_RANGE_LAST_90_DAYS,
	DateRangeId,
} from '../lib/date-ranges';
import getState from '../lib/selectors/get-state';

/**
 * The Stats v2 gate behind each range. Stats v2 has no 90-day shortcut; its 90 days are the summary's quarter.
 */
export const DATE_RANGE_GATES: Record< DateRangeId, string > = {
	[ DATE_RANGE_LAST_7_DAYS ]: STATS_FEATURE_DATE_CONTROL_LAST_7_DAYS,
	[ DATE_RANGE_LAST_30_DAYS ]: STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
	[ DATE_RANGE_LAST_90_DAYS ]: STATS_FEATURE_SUMMARY_LINKS_QUARTER,
	[ DATE_RANGE_LAST_12_MONTHS ]: STATS_FEATURE_DATE_CONTROL_LAST_12_MONTHS,
};

/**
 * Whether the site's plan locks a stat type, by Stats v2's `shouldGateStats`. Jetpack seeds the site's features into the widget's state on every connected site, Simple included, so there is nothing to fetch.
 * @param siteId   The site the widget shows.
 * @param statType The stat type to check.
 */
export function isStatTypeGated( siteId: number, statType: string ): boolean {
	// The widget loads no purchases, and the gate reads them for every site.
	return shouldGateStats( { purchases: { data: [] }, ...getState() }, siteId, statType );
}

/**
 * Checkout for the plan that unlocks a stat type, as Stats v2's upsell opens it, coming back to this page.
 * @param siteId   The site the widget shows.
 * @param statType The locked stat type.
 * @returns `undefined` where the widget's state does not know the site.
 */
export function getUpgradeUrl( siteId: number, statType: string ): string | undefined {
	const siteSlug = getSiteSlug( getState(), siteId );
	if ( ! siteSlug ) {
		return undefined;
	}

	const url = new URL(
		`https://wordpress.com/checkout/${ siteSlug }/${ statTypeToPlan( statType ) }`
	);
	url.searchParams.set( 'redirect_to', window.location.href );
	return url.toString();
}
