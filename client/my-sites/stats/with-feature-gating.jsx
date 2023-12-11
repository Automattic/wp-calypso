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
 * This hook is used to check if a feature is enabled for a site.
 * Currently used for paid stats.
 */
export const useFeatureGating = ( featureType ) => {
	const isPaidStatsEnabled = isEnabled( 'stats/paid-wpcom-v2' );
	const siteId = useSelector( getSelectedSiteId );
	const siteHasPaidStats = useSelector( ( state ) =>
		siteHasFeature( state, siteId, FEATURE_STATS_PAID )
	);
	const canAccessFeature = isPaidStatsEnabled
		? siteHasPaidStats && [ ...trafficPaidStats, ...featureFlags ].includes( featureType )
		: true;
	return { canAccessFeature };
};
