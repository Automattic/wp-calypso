import config from '@automattic/calypso-config';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import useStatsPurchases from '../hooks/use-stats-purchases';

const useIsAdvancedFeatureEnabled = ( siteId: number ) => {
	const { isCommercialOwned, hasLoadedSitePurchases, isRequestingSitePurchases } =
		useStatsPurchases( siteId );

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const canUserManageOptions = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);
	const canUserViewStats = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'view_stats' )
	);

	const { isLoading: isLoadingNotices, data: purchaseNotPostponed } = useNoticeVisibilityQuery(
		siteId,
		'focus_jetpack_purchase',
		canUserManageOptions
	);

	const isLoading = ! hasLoadedSitePurchases || isRequestingSitePurchases || isLoadingNotices;
	const hasAdcancedPlan = isCommercialOwned;

	// to redirect the user can't have a plan purached and can't have the flag true, if either is true the user either has a plan or is postponing
	const advancedFeaturesEnabled =
		config.isEnabled( 'stats/utm-module' ) &&
		isSiteJetpackNotAtomic &&
		hasAdcancedPlan &&
		canUserViewStats && // this might be a redundant check
		purchaseNotPostponed; // what about editors?

	return { isLoading, advancedFeaturesEnabled };
};

export default useIsAdvancedFeatureEnabled;
