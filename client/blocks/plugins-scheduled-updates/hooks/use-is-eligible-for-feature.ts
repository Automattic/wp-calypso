import { WPCOM_FEATURES_SCHEDULED_UPDATES } from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import getHasLoadedSiteFeatures from 'calypso/state/selectors/has-loaded-site-features';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { hasLoadedSitePlansFromServer } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const useIsEligibleForFeature = function () {
	const siteId = useSelector( getSelectedSiteId );

	const isFeaturesLoaded: boolean = useSelector( ( state ) =>
		getHasLoadedSiteFeatures( state, siteId )
	);

	const isSitePlansLoaded: boolean = useSelector( ( state ) =>
		hasLoadedSitePlansFromServer( state, siteId )
	);

	const hasScheduledUpdatesFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_SCHEDULED_UPDATES )
	);
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId as number ) );
	const isEligibleForFeature = hasScheduledUpdatesFeature && isAtomic;
	return {
		isEligibleForFeature,
		isAtomic,
		hasScheduledUpdatesFeature,
		isFeaturesLoaded,
		isSitePlansLoaded,
		loading: ! isFeaturesLoaded || ! isSitePlansLoaded,
	};
};
