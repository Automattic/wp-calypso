import { activeAgencyQuery, agencyMigrationCommissionSitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { selectCommissionSites } from '../lib/select-commission-sites';

export default function useFetchTaggedSitesForMigration() {
	const { data: agency, isLoading: isLoadingAgency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id;

	const { data, isLoading } = useQuery( {
		...agencyMigrationCommissionSitesQuery( agencyId ),
		select: selectCommissionSites,
		refetchOnWindowFocus: false,
	} );

	// The commission sites query is disabled until the agency id resolves, and a
	// disabled query reports `isLoading: false` — so callers would read an empty
	// result and render the empty state before the request is even made.
	return { data, isLoading: isLoadingAgency || isLoading };
}
