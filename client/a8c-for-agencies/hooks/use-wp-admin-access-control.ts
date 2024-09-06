import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { AppState } from 'calypso/types';

export default function useWPAdminAccessControl( { siteId }: { siteId: number } ) {
	const agency = useSelector( getActiveAgency );

	const role = agency?.user?.role;

	const userCapabilities = useSelector( ( state: AppState ) =>
		siteId ? state?.currentUser?.capabilities?.[ siteId ] : []
	);

	const hasCapability = userCapabilities?.[ 'manage_options' ];

	return {
		noWPAdminAccess: isA8CForAgencies() && role === 'a4a_manager' && ! hasCapability,
	};
}
