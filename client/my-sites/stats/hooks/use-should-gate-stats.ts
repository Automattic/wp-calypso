import config from '@automattic/calypso-config';
import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
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
	STATS_FEATURE_DATE_CONTROL_LAST_90_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_YEAR,
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_QUARTER,
	STATS_FEATURE_SUMMARY_LINKS_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_ALL,
} from '../constants';
import { isSiteNew } from './use-site-compulsory-plan-selection-qualified-check';
import { hasAnyPlan } from './use-stats-purchases';

const paidStatsPaywall = [
	STAT_TYPE_TOP_POSTS,
	STAT_TYPE_COUNTRY_VIEWS,
	STAT_TYPE_REFERRERS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_EMAILS_SUMMARY,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_VIDEO_PLAYS,
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
	const siteFeatures = getSiteFeatures( state, siteId );
	const siteHasPaidStats = siteHasFeature( state, siteId, FEATURE_STATS_PAID );

	const restrictDashboard = config.isEnabled( 'stats/restricted-dashboard' );
	const isNewSite = isSiteNew( state, siteId );
	const hasAnyStatsPlan = hasAnyPlan( state, siteId );

	// Check gated modules for Jetpack sites.
	if ( jetpackSite && ! atomicSite ) {
		// TODO: Determine more paywall segments and granular control for paid stats.
		if ( restrictDashboard && isNewSite && ! hasAnyStatsPlan ) {
			return [ ...paidStatsPaywall ].includes( statType );
		}

		return false;
	}

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
