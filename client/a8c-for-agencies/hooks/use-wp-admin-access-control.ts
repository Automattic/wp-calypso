import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { AppState } from 'calypso/types';

type SiteCapabilities = Record< string, boolean > | undefined;

/**
 * Whether the current user lacks WP Admin access on a given site.
 *
 * This is true for A4A team members (`a4a_manager`) who have not been added to
 * the underlying WordPress.com site, so they don't have the `manage_options`
 * capability there. Agency owners (`a4a_administrator`) always have access.
 */
export function hasNoWPAdminAccess( {
	role,
	capabilities,
}: {
	role: string | undefined;
	capabilities: SiteCapabilities;
} ): boolean {
	return isA8CForAgencies() && role === 'a4a_manager' && ! capabilities?.[ 'manage_options' ];
}

export default function useWPAdminAccessControl( { siteId }: { siteId: number } ) {
	const agency = useSelector( getActiveAgency );

	const role = agency?.user?.role;

	const capabilities = useSelector( ( state: AppState ) =>
		siteId ? state?.currentUser?.capabilities?.[ siteId ] : undefined
	);

	return {
		noWPAdminAccess: hasNoWPAdminAccess( { role, capabilities } ),
	};
}
