import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
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

const featureFlags = [ 'stats/date-control' ];

/*
 * Utility function intended to be used with useSelector or redux connect mapStateToProps.
 * For example in mapStateToProps:
 * const hasPaidStatsFeature = hasPaidStatsFeature( state, siteId, 'statsSearchTerms' );
 */
export const checkPaidStatsFeature = (
	state: object,
	siteId: number | null,
	featureType: string
) => {
	const isPaidStatsEnabled = isEnabled( 'stats/paid-wpcom-v2' );
	const isOdysseyStats = isEnabled( 'is_running_in_jetpack_site' );
	const jetpackSite = isJetpackSite( state, siteId );
	const siteHasPaidStats = siteHasFeature( state, siteId, FEATURE_STATS_PAID );

	// check feature flags
	if ( ! isPaidStatsEnabled || isOdysseyStats ) {
		return false;
	}
	// check site type
	if ( jetpackSite ) {
		return false;
	}
	// check site feature access
	if ( ! siteHasPaidStats ) {
		return false;
	}

	// check if the featureType is part of paid stats
	return [ ...trafficPaidStats, ...featureFlags ].includes( featureType );
};

/*
 * Check if a stat feature can be accessed for wpcom paid stats.
 */
export const useWpcomPaidStats = ( featureType: string ) => {
	const siteId = useSelector( getSelectedSiteId );
	const hasPaidStatsFeature = useSelector( ( state ) =>
		checkPaidStatsFeature( state, siteId, featureType )
	);
	return { hasPaidStatsFeature };
};
