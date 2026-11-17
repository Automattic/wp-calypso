import {
	STATS_FEATURE_DATE_CONTROL_LAST_12_MONTHS,
	STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_7_DAYS,
	STATS_FEATURE_SUMMARY_LINKS_QUARTER,
} from 'calypso/my-sites/stats/constants';
import { shouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import { statTypeToPlan } from 'calypso/my-sites/stats/stat-type-to-plan';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import useSiteFeaturesQuery from '../hooks/use-site-features-query';
import config from '../lib/config-api';
import {
	DATE_RANGE_LAST_12_MONTHS,
	DATE_RANGE_LAST_30_DAYS,
	DATE_RANGE_LAST_7_DAYS,
	DATE_RANGE_LAST_90_DAYS,
	DateRangeId,
} from '../lib/date-ranges';
import getState from '../lib/selectors/get-state';

/**
 * The Stats v2 gate behind each range. Stats v2 has no 90-day shortcut; its 90 days are the
 * summary's quarter.
 */
export const DATE_RANGE_GATES: Record< DateRangeId, string > = {
	[ DATE_RANGE_LAST_7_DAYS ]: STATS_FEATURE_DATE_CONTROL_LAST_7_DAYS,
	[ DATE_RANGE_LAST_30_DAYS ]: STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
	[ DATE_RANGE_LAST_90_DAYS ]: STATS_FEATURE_SUMMARY_LINKS_QUARTER,
	[ DATE_RANGE_LAST_12_MONTHS ]: STATS_FEATURE_DATE_CONTROL_LAST_12_MONTHS,
};

export type IsGated = ( statType: string ) => boolean;

/**
 * Whether the site may see a stat type, by the same rules as Stats v2's `shouldGateStats`.
 *
 * Jetpack seeds the site's features into the widget's state from its plan; on Simple sites they
 * are fetched, as Stats v2 fetches them there. Features that never arrive leave everything open,
 * which is also Stats v2's answer.
 * @param siteId The site the widget shows.
 * @returns `isGated` for a stat type, and whether the answer is still loading.
 */
export default function useStatsGates( siteId: number ): { isLoading: boolean; isGated: IsGated } {
	const seededState = getState();
	const seededFeatures = seededState.sites?.features;
	const shouldFetchFeatures =
		! seededFeatures?.[ siteId ] && ! config.isEnabled( 'is_running_in_jetpack_site' );

	const { data: fetchedFeatures, isPending } = useSiteFeaturesQuery( siteId, shouldFetchFeatures );
	const isLoading = shouldFetchFeatures && isPending;

	const state = {
		// The widget loads no purchases, which the gate reads for Jetpack sites.
		purchases: { data: [] },
		...seededState,
		sites: {
			...seededState.sites,
			features: fetchedFeatures
				? { ...seededFeatures, [ siteId ]: { data: fetchedFeatures } }
				: seededFeatures,
		},
	};

	return {
		isLoading,
		isGated: ( statType ) => ! isLoading && shouldGateStats( state, siteId, statType ),
	};
}

/**
 * Checkout for the plan that unlocks a stat type, as Stats v2's upsell opens it, coming back to
 * this page.
 * @param siteId   The site the widget shows.
 * @param statType The locked stat type.
 * @returns `null` where the widget's state does not know the site.
 */
export function getUpgradeUrl( siteId: number, statType: string ): string | null {
	const state = getState();
	const siteSlug = state.sites?.items?.[ siteId ] && getSiteSlug( state, siteId );
	if ( ! siteSlug ) {
		return null;
	}

	const url = new URL(
		`https://wordpress.com/checkout/${ siteSlug }/${ statTypeToPlan( statType ) }`
	);
	url.searchParams.set( 'redirect_to', window.location.href );
	return url.toString();
}
