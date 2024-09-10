import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite, getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	STATS_FEATURE_DOWNLOAD_CSV,
	STAT_TYPE_TOP_POSTS,
	STAT_TYPE_REFERRERS,
	STAT_TYPE_COUNTRY_VIEWS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_VIDEO_PLAYS,
	STAT_TYPE_INSIGHTS_ALL_TIME_STATS,
	STAT_TYPE_INSIGHTS_MOST_POPULAR_TIME,
	STAT_TYPE_INSIGHTS_MOST_POPULAR_DAY,
	STAT_TYPE_INSIGHTS_ALL_TIME_INSIGHTS,
	STAT_TYPE_TAGS,
	STAT_TYPE_COMMENTS,
	STATS_TYPE_DEVICE_STATS,
	STATS_FEATURE_UTM_STATS,
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_90_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_YEAR,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_QUARTER,
	STATS_FEATURE_SUMMARY_LINKS_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_ALL,
} from '../constants';
import {
	hasSupportedCommercialUse,
	hasSupportedVideoPressUse,
	shouldShowPaywallAfterGracePeriod,
} from './use-stats-purchases';

// If Jetpack sites don't have any purchase that supports commercial use, gate advanced modules accordingly.
const jetpackStatsAdvancedPaywall = [ STATS_TYPE_DEVICE_STATS, STATS_FEATURE_UTM_STATS ];

// If Jetpack commerical sites don't have any purchase that supports commercial use,
// gate modules or cards accordingly.
const jetpackStatsCommercialPaywall = [
	STAT_TYPE_TOP_POSTS,
	STAT_TYPE_COUNTRY_VIEWS,
	STAT_TYPE_REFERRERS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_VIDEO_PLAYS,
	STAT_TYPE_INSIGHTS_ALL_TIME_STATS,
	STAT_TYPE_INSIGHTS_MOST_POPULAR_TIME,
	STAT_TYPE_INSIGHTS_MOST_POPULAR_DAY,
	STAT_TYPE_INSIGHTS_ALL_TIME_INSIGHTS,
	STAT_TYPE_TAGS,
	STAT_TYPE_COMMENTS,
	STATS_TYPE_DEVICE_STATS,
	STATS_FEATURE_UTM_STATS,
];

// If Jetpack commerical sites don't have any purchase that supports commercial use,
// gate controls accordingly.
const granularControlForJetpackStatsCommercialPaywall = [
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_90_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_YEAR,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
	STATS_FEATURE_DOWNLOAD_CSV,
];

// Gated modules for WPCOM sites without the FEATURE_STATS_PAID feature.
const paidStats = [
	STAT_TYPE_REFERRERS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_VIDEO_PLAYS,
];

// Gated controls for WPCOM sites without the FEATURE_STATS_PAID feature.
const granularControlForPaidStats = [
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_DATE_CONTROL_LAST_90_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_YEAR,
	STATS_FEATURE_DOWNLOAD_CSV,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_QUARTER,
	STATS_FEATURE_SUMMARY_LINKS_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_ALL,
];

/*
 * Check if a site can access a specific module or card based on the WPCOM plan or Jetpack Stats product purchase.
 *
 * Utility function intended to be used with useSelector or redux connect mapStateToProps.
 * For example in mapStateToProps:
 * const isGatedStats = shouldGateStats( state, siteId, STAT_TYPE_SEARCH_TERMS );
 */
export const shouldGateStats = ( state: object, siteId: number | null, statType: string ) => {
	if ( ! siteId ) {
		return true;
	}

	const jetpackSite = isJetpackSite( state, siteId );
	const atomicSite = isAtomicSite( state, siteId );

	const supportStatsCommercialUse = hasSupportedCommercialUse( state, siteId );

	// Check gated modules for Jetpack sites.
	if ( jetpackSite && ! atomicSite ) {
		if ( supportStatsCommercialUse ) {
			return false;
		}

		// The particular case for checking the Videos module by the VideoPress product purchase.
		if (
			[ STAT_TYPE_VIDEO_PLAYS ].includes( statType ) &&
			hasSupportedVideoPressUse( state, siteId )
		) {
			return false;
		}

		// Do not paywall VIP sites.
		// `is_vip` is not correctly placed in Odyssey, so we need to check `options.is_vip` as well.
		const isVip =
			isVipSite( state as object, siteId as number ) || getSiteOption( state, siteId, 'is_vip' );
		if ( isVip ) {
			return false;
		}

		const isSiteCommercial = getSiteOption( state, siteId, 'is_commercial' ) || false;
		if ( isSiteCommercial ) {
			// Paywall basic stats for commercial sites with:
			// 1. Monthly views reached the paywall threshold.
			// 2. Current usage passed over grace period days.
			if ( shouldShowPaywallAfterGracePeriod( state, siteId ) ) {
				return [
					...jetpackStatsCommercialPaywall,
					...granularControlForJetpackStatsCommercialPaywall,
				].includes( statType );
			}

			// Paywall advanced stats for commercial sites with monthly views less than 1k.
			return [ ...jetpackStatsAdvancedPaywall ].includes( statType );
		}

		// Paywall advanced stats for non-commercial sites.
		return [ ...jetpackStatsAdvancedPaywall ].includes( statType );
	}

	// Gate advanced stats for non-Jetpack sites unless they have a Jetpack Stats commercial purchase.
	// Dotcom sites are not able to see these modules yet, so the line wouldn't apply to them.
	if ( jetpackStatsAdvancedPaywall.includes( statType ) ) {
		return ! supportStatsCommercialUse;
	}

	const siteFeatures = getSiteFeatures( state, siteId );
	const siteHasPaidStats = siteHasFeature( state, siteId, FEATURE_STATS_PAID );

	// Check if the site features have loaded and the site has the FEATURE_STATS_PAID feature.
	if ( ! siteFeatures || siteHasPaidStats ) {
		return false;
	}

	// Sites cannot access the feature FEATURE_STATS_PAID, gate stats accordingly
	return [ ...paidStats, ...granularControlForPaidStats ].includes( statType );
};

/*
 * Check if a statType is gated.
 */
export const useShouldGateStats = ( statType: string ) => {
	const siteId = useSelector( getSelectedSiteId );
	const isGatedStats = useSelector( ( state ) => shouldGateStats( state, siteId, statType ) );

	return isGatedStats;
};
