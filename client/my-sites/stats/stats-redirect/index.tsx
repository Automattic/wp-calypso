import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isJetpackSite, getSiteSlug } from 'calypso/state/sites/selectors';
import {
	receiveStatNoticeSettings,
	requestStatNoticeSettings,
} from 'calypso/state/stats/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useSiteCompulsoryPlanSelectionQualifiedCheck from '../hooks/use-site-compulsory-plan-selection-qualified-check';
import useStatsPurchases from '../hooks/use-stats-purchases';
import StatsLoader from './stats-loader';

interface StatsRedirectFlowProps {
	children: ReactNode;
}

const StatsRedirectFlow: React.FC< StatsRedirectFlowProps > = ( { children } ) => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const { hasLoadedSitePurchases, isRequestingSitePurchases, hasAnyPlan } =
		useStatsPurchases( siteId );

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	// TODO: Consolidate permissions checks.
	// This same code is in LoadStatsPage (which calls this component) so
	// it might not be necessary here.
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
	const { isNewSite, shouldShowPaywall } = useSiteCompulsoryPlanSelectionQualifiedCheck( siteId );
	// to redirect the user can't have a plan purached and can't have the flag true, if either is true the user either has a plan or is postponing
	const redirectToPurchase =
		isSiteJetpackNotAtomic && ! hasAnyPlan && purchaseNotPostponed && shouldShowPaywall;

	// TODO: If notices are not used by class components, we don't have any reasons to launch any of those actions anymore. If we do need them, we should consider refactoring them to another component.
	const dispatch = useDispatch();
	useEffect( () => {
		if ( isLoadingNotices ) {
			// when react-query is fetching data
			dispatch( requestStatNoticeSettings( siteId ) );
		} else {
			dispatch(
				receiveStatNoticeSettings( siteId, {
					focus_jetpack_purchase: purchaseNotPostponed,
				} )
			);
		}
	}, [ dispatch, siteId, isLoadingNotices, purchaseNotPostponed ] );

	// Render conditions (for readability).
	// TODO: Determine the paywall redirection for specific routes.
	const shouldRenderPaywall =
		false && ! isLoading && redirectToPurchase && siteSlug && canUserManageOptions;
	const shouldRenderContent = ! isLoading && ( canUserViewStats || canUserManageOptions );

	// Handle possible render conditions.
	// Based on render conditions, loading state takes priority.
	if ( isLoading ) {
		return <StatsLoader />;
	}

	// Paywall is dependant on site age, type, & plan as well as user permissions.
	if ( shouldRenderPaywall ) {
		// We need to ensure we pass the irclick id for impact affiliate tracking if its set.
		const currentParams = new URLSearchParams( window.location.search );
		const queryParams = new URLSearchParams();

		queryParams.set( 'productType', 'commercial' );
		// `cmp-red` means `compulsory redirection` here.
		queryParams.set( 'from', `cmp-red${ isNewSite ? '-new-site' : '' }` );
		if ( currentParams.has( 'irclickid' ) ) {
			queryParams.set( 'irclickid', currentParams.get( 'irclickid' ) || '' );
		}

		// publish an event
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_purchase_flow_redirected` );

		// redirect to the Purchase page
		setTimeout(
			() => page.redirect( `/stats/purchase/${ siteSlug }?${ queryParams.toString() }` ),
			250
		);

		return null;
	}

	// Default is to show the user some stats.
	// There are permissions considerations though, in which case we fall
	// through and show nothing. Feels broken.
	if ( shouldRenderContent ) {
		return <>{ children }</>;
	}

	// TODO: Render a proper error message.
	// Should indicate user does not have permissions to view stats.
	// See note above regarding permissions.
	return null;
};

export default StatsRedirectFlow;
