import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import getHasLoadedSiteFeatures from 'calypso/state/selectors/has-loaded-site-features';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	STATS_FEATURE_DOWNLOAD_CSV,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_REFERRERS,
	STAT_TYPE_TOP_AUTHORS,
	STATS_FEATURE_DATE_CONTROL_LAST_90_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_YEAR,
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_QUARTER,
	STATS_FEATURE_SUMMARY_LINKS_YEAR,
	STATS_FEATURE_SUMMARY_LINKS_ALL,
	STATS_FEATURE_UTM_STATS,
} from '../constants';

const paidStats = [
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_REFERRERS,
	STAT_TYPE_TOP_AUTHORS,
	STATS_FEATURE_UTM_STATS,
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

	// check site type
	if ( jetpackSite && ! atomicSite ) {
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
	const isOdysseyStats = isEnabled( 'is_running_in_jetpack_site' );
	const siteId = useSelector( getSelectedSiteId );

	// The features are loaded from the Jetpack site object,
	// so we set the loaded flag to true by default for Odyssey Stats.
	const hasLoadedSiteFeatures =
		useSelector( ( state ) => getHasLoadedSiteFeatures( state, siteId ) ) || isOdysseyStats;
	const isGatedStats = useSelector( ( state ) => shouldGateStats( state, siteId, statType ) );

	// Avoid flickering by returning false until site features have loaded.
	return { isGatedStats: ! hasLoadedSiteFeatures || isGatedStats };
};
