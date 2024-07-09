import config from '@automattic/calypso-config';
import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
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
	STAT_TYPE_EMAILS_SUMMARY,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_VIDEO_PLAYS,
	STAT_TYPE_INSIGHTS,
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
import { hasSupportedCommercialUse } from './use-stats-purchases';

const jetpackStatsAdvancedPaywall = [ STATS_TYPE_DEVICE_STATS, STATS_FEATURE_UTM_STATS ];

const jetpackStatsCommercialPaywall = [
	STAT_TYPE_TOP_POSTS,
	STAT_TYPE_COUNTRY_VIEWS,
	STAT_TYPE_REFERRERS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_EMAILS_SUMMARY,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_VIDEO_PLAYS,
	STAT_TYPE_INSIGHTS_ALL_TIME_INSIGHTS,
	STAT_TYPE_TAGS,
	STAT_TYPE_COMMENTS,
	STAT_TYPE_INSIGHTS,
	STATS_FEATURE_UTM_STATS,
];

const granularControlForJetpackStatsCommercialPaywall = [
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_90_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_YEAR,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
];

const paidStats = [
	STAT_TYPE_REFERRERS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_SEARCH_TERMS,
];

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
 * Check if a site has access to a paid stats feature in wpcom.
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
		const restrictDashboard = config.isEnabled( 'stats/restricted-dashboard' );
		if ( ! restrictDashboard ) {
			return false;
		}

		if ( supportStatsCommercialUse ) {
			return false;
		}

		const isSiteCommercial = getSiteOption( state, siteId, 'is_commercial' ) || false;
		// Paywall basic stats for commercial sites.
		if ( isSiteCommercial ) {
			return [
				...jetpackStatsCommercialPaywall,
				...granularControlForJetpackStatsCommercialPaywall,
			].includes( statType );
		}

		// Paywall advanced stats for non-commercial sites.
		return [ ...jetpackStatsAdvancedPaywall ].includes( statType );
	}

	// Gate advanced stats for non-Jetpack sites unless they have a Jetpack Stats commercial purchase.
	if ( jetpackStatsAdvancedPaywall.includes( statType ) ) {
		return ! supportStatsCommercialUse;
	}

	const siteFeatures = getSiteFeatures( state, siteId );
	const siteHasPaidStats = siteHasFeature( state, siteId, FEATURE_STATS_PAID );

	// check if the site features have loaded and the site has paid stats feature
	if ( ! siteFeatures || siteHasPaidStats ) {
		return false;
	}

	// site cannot acesss paid stats, gate stats accordingly
	return [ ...paidStats, ...granularControlForPaidStats ].includes( statType );
};

/*
 * Check if a statType is gated wpcom paid stats.
 */
export const useShouldGateStats = ( statType: string ) => {
	const siteId = useSelector( getSelectedSiteId );
	const isGatedStats = useSelector( ( state ) => shouldGateStats( state, siteId, statType ) );

	return isGatedStats;
};
