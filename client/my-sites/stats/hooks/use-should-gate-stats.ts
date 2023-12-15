import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

// TODO: define shared variables
const trafficPaidStats = [
	'statsSearchTerms',
	'statsClicks',
	'statsReferrers',
	'statsCountryViews',
];

const featureFlags = [ 'stats/date-control', 'download-csv' ];

/*
 * Check if a site has access to a paid stats feature in wpcom.
 * Utility function intended to be used with useSelector or redux connect mapStateToProps.
 * For example in mapStateToProps:
 * const isGatedStats = shouldGateStats( state, siteId, 'statsSearchTerms' );
 */
export const shouldGateStats = ( state: object, siteId: number | null, statType: string ) => {
	if ( ! siteId ) {
		return true;
	}

	const isPaidStatsEnabled = isEnabled( 'stats/paid-wpcom-v2' );
	const isOdysseyStats = isEnabled( 'is_running_in_jetpack_site' );
	const jetpackSite = isJetpackSite( state, siteId );
	const atomicSite = isAtomicSite( state, siteId );
	const siteHasPaidStats = siteHasFeature( state, siteId, FEATURE_STATS_PAID );

	// check site type
	if ( jetpackSite || atomicSite ) {
		return false;
	}

	// check if the site has paid stats feature
	if ( siteHasPaidStats ) {
		return false;
	}

	// check feature flags
	if ( ! isPaidStatsEnabled ) {
		return false;
	}
	if ( isOdysseyStats ) {
		// don't gate stats if using Odyssey stats
		return false;
	}

	// site cannot acesss paid stats, gate stats accordingly
	return [ ...trafficPaidStats, ...featureFlags ].includes( statType );
};

/*
 * Check if a statType is gated wpcom paid stats.
 */
export const useShouldGateStats = ( statType: string ) => {
	const siteId = useSelector( getSelectedSiteId );
	const isGatedStats = useSelector( ( state ) => shouldGateStats( state, siteId, statType ) );
	return { isGatedStats };
};
