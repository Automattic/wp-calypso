import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import useStatsPurchases from '../hooks/use-stats-purchases';

const useIsAdvancedFeatureEnabled = ( siteId: number ) => {
	const { supportCommercialUse, hasLoadedSitePurchases, isRequestingSitePurchases } =
		useStatsPurchases( siteId );

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const canUserViewStats = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'view_stats' )
	);

	const isLoading = ! hasLoadedSitePurchases || isRequestingSitePurchases;

	// check if the user and the blog should have the access to advanced features
	const isAdvancedFeatureEnabled =
		isSiteJetpackNotAtomic && supportCommercialUse && canUserViewStats;

	return { isLoading, isAdvancedFeatureEnabled };
};

export default useIsAdvancedFeatureEnabled;
