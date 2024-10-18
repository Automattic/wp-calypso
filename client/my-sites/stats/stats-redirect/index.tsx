import { ReactNode } from 'react';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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

	// Default is to show the user some stats.
	// There are permissions considerations though, in which case we fall
	// through and show nothing. Feels broken.
	if ( canUserViewStats || canUserManageOptions ) {
		return <>{ children }</>;
	}

	// TODO: Render a proper error message.
	// Should indicate user does not have permissions to view stats.
	// See note above regarding permissions.
	return null;
};

export default StatsRedirectFlow;
