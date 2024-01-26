import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { useSelector } from 'calypso/state';
import { isJetpackSite, getSiteOption, getSiteSlug } from 'calypso/state/sites/selectors';
import {
	requestStatNoticeSettings,
	receiveStatNoticeSettings,
} from 'calypso/state/stats/notices/actions';
import { isStatsNoticeSettingsFetching } from 'calypso/state/stats/notices/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useStatsPurchases from '../hooks/use-stats-purchases';

const StatsRedirectFlow = () => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const siteCreatedTimeStamp = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'created_at' )
	) as string;

	const { isFreeOwned, isPWYWOwned, isCommercialOwned } = useStatsPurchases( siteId );

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const { isFetching, data: purchaseNotPosponed } = useNoticeVisibilityQuery(
		siteId,
		'focus_jetpack_purchase'
	);

	const hasPlan = isFreeOwned || isPWYWOwned || isCommercialOwned;
	// TODO: update the date to the release date when the feature is ready.
	const qualifiedUser =
		siteCreatedTimeStamp && new Date( siteCreatedTimeStamp ) > new Date( '2024-01-15' );

	// to redirect the user can't have a plan purached and can't have the flag true, if either is true the user either has a plan or is postponing
	const redirectToPurchase =
		config.isEnabled( 'stats/checkout-flows-v2' ) &&
		isSiteJetpackNotAtomic &&
		! hasPlan &&
		purchaseNotPosponed &&
		qualifiedUser;

	const isRequesting = useSelector( ( state: object ) => isStatsNoticeSettingsFetching( state ) );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( isFetching ) {
			// when react-query is fetching data
			dispatch( requestStatNoticeSettings( siteId ) );
		} else {
			dispatch(
				receiveStatNoticeSettings( siteId, {
					focus_jetpack_purchase: purchaseNotPosponed,
				} )
			);
		}
	}, [ dispatch, redirectToPurchase, siteId, isFetching, purchaseNotPosponed ] );

	// render purchase flow for Jetpack sites created after February 2024
	if ( ! isFetching && ! isRequesting && redirectToPurchase && siteSlug ) {
		page.redirect( `/stats/purchase/${ siteSlug }?productType=commercial` );

		return;
	}
};

export default StatsRedirectFlow;
