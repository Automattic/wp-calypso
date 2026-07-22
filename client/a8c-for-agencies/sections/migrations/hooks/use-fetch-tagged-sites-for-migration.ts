import { activeAgencyQuery, agencyMigrationCommissionSitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { selectCommissionSites } from '../lib/select-commission-sites';

export default function useFetchTaggedSitesForMigration() {
	const { data: agency, isLoading: isAgencyLoading } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id;

	const query = useQuery( {
		...agencyMigrationCommissionSitesQuery( agencyId ),
		select: selectCommissionSites,
		refetchOnWindowFocus: false,
	} );

	return { ...query, isLoading: isAgencyLoading || query.isLoading };
}
