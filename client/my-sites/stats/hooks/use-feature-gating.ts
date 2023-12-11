import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
 * const canAccessFeature = checkFeatureGating( state, siteId, 'statsSearchTerms' );
 */
export const checkFeatureGating = ( state: object, siteId: number | null, featureType: string ) => {
	const isPaidStatsEnabled = isEnabled( 'stats/paid-wpcom-v2' );
	const siteHasPaidStats = siteHasFeature( state, siteId, FEATURE_STATS_PAID );

	const canAccessFeature = isPaidStatsEnabled
		? siteHasPaidStats && [ ...trafficPaidStats, ...featureFlags ].includes( featureType )
		: true;

	return canAccessFeature;
};

/*
 * This hook is used to check if a stat feature is enabled for a site.
 * Currently used for paid stats.
 */
export const useFeatureGating = ( featureType: string ) => {
	const siteId = useSelector( getSelectedSiteId );
	const canAccessFeature = useSelector( ( state ) =>
		checkFeatureGating( state, siteId, featureType )
	);
	return { canAccessFeature };
};
