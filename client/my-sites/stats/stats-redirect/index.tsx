import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isJetpackSite, getSiteOption, getSiteSlug } from 'calypso/state/sites/selectors';
import {
	requestStatNoticeSettings,
	receiveStatNoticeSettings,
} from 'calypso/state/stats/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useStatsPurchases from '../hooks/use-stats-purchases';
import StatsLoader from './stats-loader';

interface StatsRedirectFlowProps {
	children: ReactNode;
}

const StatsRedirectFlow: React.FC< StatsRedirectFlowProps > = ( { children } ) => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const siteCreatedTimeStamp = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'created_at' )
	) as string;
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const {
		isFreeOwned,
		isPWYWOwned,
		isCommercialOwned,
		supportCommercialUse,
		isRequestingSitePurchases,
	} = useStatsPurchases( siteId );

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const canUserManageOptions = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);
	const canUserViewStats = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'view_stats' )
	);

	const { isFetching: isRequestingNotices, data: purchaseNotPosponed } = useNoticeVisibilityQuery(
		siteId,
		'focus_jetpack_purchase',
		canUserManageOptions
	);

	// in Calypso `isRequestingSitePurchases` is constantly looping requesting and not requesting
	const isFetching = ( isOdysseyStats && isRequestingSitePurchases ) || isRequestingNotices;
	const hasPlan = isFreeOwned || isPWYWOwned || isCommercialOwned || supportCommercialUse;
	const qualifiedUser =
		siteCreatedTimeStamp && new Date( siteCreatedTimeStamp ) > new Date( '2024-01-31' );

	// to redirect the user can't have a plan purached and can't have the flag true, if either is true the user either has a plan or is postponing
	const redirectToPurchase =
		config.isEnabled( 'stats/checkout-flows-v2' ) &&
		isSiteJetpackNotAtomic &&
		! hasPlan &&
		purchaseNotPosponed &&
		qualifiedUser;

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
	if ( ! isFetching && redirectToPurchase && siteSlug ) {
		// We need to ensure we pass the irclick id for impact affiliate tracking if its set.
		const currentParams = new URLSearchParams( window.location.search );
		const queryParams = new URLSearchParams();

		queryParams.set( 'productType', 'commercial' );
		if ( currentParams.has( 'irclickid' ) ) {
			queryParams.set( 'irclickid', currentParams.get( 'irclickid' ) || '' );
		}

		// publish an event
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_purchase_flow_redirected` );

		// redirect to the Traffic page
		setTimeout(
			() => page.redirect( `/stats/purchase/${ siteSlug }?${ queryParams.toString() }` ),
			250
		);

		return null;
	} else if ( ! isFetching || ( canUserViewStats && ! canUserManageOptions ) ) {
		return <>{ children }</>;
	} else if ( isFetching ) {
		return <StatsLoader />;
	}

	return null;
};

export default StatsRedirectFlow;
