import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import {
	receiveStatNoticeSettings,
	requestStatNoticeSettings,
} from 'calypso/state/stats/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsLoader from './stats-loader';

interface StatsRedirectFlowProps {
	children: ReactNode;
}

const StatsRedirectFlow: React.FC< StatsRedirectFlowProps > = ( { children } ) => {
	const siteId = useSelector( getSelectedSiteId );

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

	const shouldRenderContent = ! isLoadingNotices && ( canUserViewStats || canUserManageOptions );

	// Handle possible render conditions.
	// Based on render conditions, loading state takes priority.
	if ( isLoadingNotices ) {
		return <StatsLoader />;
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
