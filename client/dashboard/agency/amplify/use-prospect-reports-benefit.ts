import { amplifyReportsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

/**
 * Prospect reports data for the Tiers page benefit row. Only fetches when the
 * user can open Prospect reports, so team members who can't make no extra request.
 */
export function useProspectReportsBenefit( {
	agencyId,
	allowed,
}: {
	agencyId?: number;
	allowed: boolean;
} ) {
	const { data } = useQuery( {
		...amplifyReportsQuery( agencyId ?? 0 ),
		enabled: allowed && !! agencyId,
		// The Prospect reports page polls while reports run; this summary doesn't need to.
		refetchInterval: false,
	} );

	return {
		usage: data?.usage,
		hasReports: ( data?.reports?.length ?? 0 ) > 0,
	};
}
