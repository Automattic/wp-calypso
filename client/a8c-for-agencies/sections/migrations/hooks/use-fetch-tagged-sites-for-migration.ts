import { activeAgencyQuery, agencyMigrationCommissionSitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { selectCommissionSites } from '../lib/select-commission-sites';

export default function useFetchTaggedSitesForMigration() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id;

	return useQuery( {
		...agencyMigrationCommissionSitesQuery( agencyId ),
		select: selectCommissionSites,
		refetchOnWindowFocus: false,
	} );
}
