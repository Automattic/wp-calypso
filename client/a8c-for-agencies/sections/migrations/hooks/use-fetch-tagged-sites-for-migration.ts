import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { TaggedSite } from '../types';

export default function useFetchTaggedSitesForMigration() {
	const agencyId = useSelector( getActiveAgencyId );

	const query = useQuery( {
		queryKey: [ 'a4a-migration-commissions', agencyId ],
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/sites`,
			} ),
		refetchOnWindowFocus: false,
	} );

	// Filter sites to only include those with pending, verified, or paid incentive_status
	const filteredData = useMemo( () => {
		if ( ! query.data ) {
			return query.data;
		}

		const sites = Array.isArray( query.data ) ? query.data : query.data.sites || [];
		return sites.filter( ( site: TaggedSite ) => {
			const status = site.incentive_status || '';
			return status === 'pending' || status === 'verified' || status === 'paid';
		} );
	}, [ query.data ] );

	return {
		...query,
		data: filteredData,
	};
}
