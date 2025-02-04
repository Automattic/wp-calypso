import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_STATS_FREE,
	FEATURE_STATS_PAID,
	FEATURE_STATS_COMMERCIAL,
	FEATURE_STATS_BASIC,
} from '@automattic/calypso-products';
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
	STAT_TYPE_FILE_DOWNLOADS,
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
	STATS_FEATURE_DATE_CONTROL_TODAY,
	STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
	STATS_FEATURE_DATE_CONTROL_MONTH_TO_DATE,
	STATS_FEATURE_DATE_CONTROL_LAST_12_MONTHS,
	STATS_FEATURE_DATE_CONTROL_YEAR_TO_DATE,
	STATS_FEATURE_DATE_CONTROL_LAST_3_YEARS,
	STATS_FEATURE_DATE_CONTROL_CUSTOM_DATE_RANGE,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_30_DAYS,
	STATS_FEATURE_SUMMARY_LINKS_QUARTER,
	STATS_FEATURE_SUMMARY_LINKS_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_ALL,
	STATS_FEATURE_PAGE_INSIGHTS,
	STATS_FEATURE_PAGE_TRAFFIC,
	STATS_FEATURE_SUMMARY_LINKS_7_DAYS,
	STATS_FEATURE_LOCATION_REGION_VIEWS,
	STATS_FEATURE_LOCATION_CITY_VIEWS,
} from '../constants';
import {
	hasSupportedCommercialUse,
	hasSupportedVideoPressUse,
	shouldShowPaywallAfterGracePeriod,
} from './use-stats-purchases';

const defaultDateControlGates = [
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_DATE_CONTROL_TODAY,
	STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
	STATS_FEATURE_DATE_CONTROL_MONTH_TO_DATE,
	STATS_FEATURE_DATE_CONTROL_LAST_12_MONTHS,
	STATS_FEATURE_DATE_CONTROL_YEAR_TO_DATE,
	STATS_FEATURE_DATE_CONTROL_LAST_3_YEARS,
	STATS_FEATURE_DATE_CONTROL_CUSTOM_DATE_RANGE,
];

// If Jetpack sites don't have any purchase that supports commercial use, gate advanced modules accordingly.
const jetpackStatsAdvancedPaywall = [
	STATS_TYPE_DEVICE_STATS,
	STATS_FEATURE_UTM_STATS,
	STATS_FEATURE_LOCATION_REGION_VIEWS,
	STATS_FEATURE_LOCATION_CITY_VIEWS,
];

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
	STATS_FEATURE_LOCATION_REGION_VIEWS,
	STATS_FEATURE_LOCATION_CITY_VIEWS,
];

// If Jetpack commerical sites don't have any purchase that supports commercial use,
// gate controls accordingly.
const granularControlForJetpackStatsCommercialPaywall = [
	...defaultDateControlGates,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
	STATS_FEATURE_DOWNLOAD_CSV,
];

// wpcom: All stats are gated for WPCOM sites without the STATS_FREE, STATS_BASIC, STATS_PAID or STATS_COMMERCIAL feature.
const gatedStats = [
	// Commercial stats
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_VIDEO_PLAYS,
	STATS_FEATURE_UTM_STATS,
	STATS_TYPE_DEVICE_STATS,
	STATS_FEATURE_LOCATION_REGION_VIEWS,
	STATS_FEATURE_LOCATION_CITY_VIEWS,

	// Paid Stats
	STAT_TYPE_TOP_POSTS,
	STAT_TYPE_REFERRERS,
	STAT_TYPE_COUNTRY_VIEWS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_FILE_DOWNLOADS,
	...defaultDateControlGates,
	STATS_FEATURE_DOWNLOAD_CSV,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_7_DAYS,
	STATS_FEATURE_SUMMARY_LINKS_30_DAYS,
	STATS_FEATURE_SUMMARY_LINKS_QUARTER,
	STATS_FEATURE_SUMMARY_LINKS_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_ALL,

	// Traffic and insights pages (page level upsell)
	STATS_FEATURE_PAGE_INSIGHTS,
	STATS_FEATURE_PAGE_TRAFFIC,
];

// wpcom: Gate UTM and device stats for sites with STATS_FREE feature, this is the feature applied to legacy sites.
const freeStats = [
	// New Commercial stats are the only thing we gate for legacy sites.
	STATS_FEATURE_UTM_STATS,
	STATS_TYPE_DEVICE_STATS,
	STATS_FEATURE_LOCATION_REGION_VIEWS,
	STATS_FEATURE_LOCATION_CITY_VIEWS,
];

// wpcom: Gate UTM and device stats for sites with STATS_BASIC feature, this is the feature applied to legacy sites.
const basicStats = [
	// Commercial stats
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_VIDEO_PLAYS,
	STATS_FEATURE_UTM_STATS,
	STATS_TYPE_DEVICE_STATS,
	STATS_FEATURE_LOCATION_REGION_VIEWS,
	STATS_FEATURE_LOCATION_CITY_VIEWS,

	// Paid stats
	STAT_TYPE_REFERRERS,
	STAT_TYPE_CLICKS,
	STATS_FEATURE_DATE_CONTROL_LAST_12_MONTHS,
	STATS_FEATURE_DATE_CONTROL_YEAR_TO_DATE,
	STATS_FEATURE_DATE_CONTROL_LAST_3_YEARS,
	STATS_FEATURE_DATE_CONTROL_CUSTOM_DATE_RANGE,
	STATS_FEATURE_DOWNLOAD_CSV,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_QUARTER,
	STATS_FEATURE_SUMMARY_LINKS_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_ALL,
];

// wpcom: Gated modules for WPCOM sites with the FEATURE_STATS_PAID feature.
export const paidStats = [
	// Commercial stats
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_VIDEO_PLAYS,
	STATS_TYPE_DEVICE_STATS,
	STATS_FEATURE_UTM_STATS,
	STATS_FEATURE_LOCATION_REGION_VIEWS,
	STATS_FEATURE_LOCATION_CITY_VIEWS,
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

	const siteFeatures = getSiteFeatures( state, siteId );
	const siteHasCommercialStats = siteHasFeature( state, siteId, FEATURE_STATS_COMMERCIAL );
	const siteHasFreeStats = siteHasFeature( state, siteId, FEATURE_STATS_FREE );
	const siteHasPaidStats = siteHasFeature( state, siteId, FEATURE_STATS_PAID );
	const siteHasBasicStats = siteHasFeature( state, siteId, FEATURE_STATS_BASIC );

	// Check if the site features have loaded.
	if ( ! siteFeatures ) {
		return false;
	}

	// Commercial stats has no paywall.
	if ( siteHasCommercialStats ) {
		return false;
	}

	// Legacy free stats given to all sites before 2024-01-09.
	if ( siteHasFreeStats ) {
		return freeStats.includes( statType );
	}

	// Paid stats given to personal and higher plans
	if ( siteHasPaidStats ) {
		if ( ! isEnabled( 'stats/paid-wpcom-v3' ) ) {
			// if v3 is not enabled, treat paid stats as commercial stats
			return false;
		}
		return paidStats.includes( statType );
	}

	// Basic stats given to free sites before 2024-12-06.
	if ( siteHasBasicStats ) {
		return basicStats.includes( statType );
	}

	// If v3 is not enabled do not directly gate top posts, file downloads, and country views.
	// We could remove this check once v3 is enabled.
	if (
		! isEnabled( 'stats/paid-wpcom-v3' ) &&
		[ STAT_TYPE_TOP_POSTS, STAT_TYPE_FILE_DOWNLOADS, STAT_TYPE_COUNTRY_VIEWS ].includes( statType )
	) {
		return false;
	}

	// All other sites get gated to 7 days + paywall upsell
	return gatedStats.includes( statType );
};

/*
 * Check if a statType is gated.
 */
export const useShouldGateStats = ( statType: string ) => {
	const siteId = useSelector( getSelectedSiteId );
	const isGatedStats = useSelector( ( state ) => shouldGateStats( state, siteId, statType ) );

	return isGatedStats;
};
