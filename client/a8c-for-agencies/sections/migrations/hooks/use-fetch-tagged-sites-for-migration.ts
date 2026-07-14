import { agencyMigrationCommissionSitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { selectCommissionSites } from '../lib/select-commission-sites';

export default function useFetchTaggedSitesForMigration() {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		...agencyMigrationCommissionSitesQuery( agencyId ),
		select: selectCommissionSites,
	} );
}
