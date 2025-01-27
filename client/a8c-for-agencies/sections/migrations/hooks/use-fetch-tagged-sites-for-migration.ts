import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4A_MIGRATED_SITE_TAG } from '../lib/constants';

export default function useFetchTaggedSitesForMigration() {
	const agencyId = useSelector( getActiveAgencyId );

	const data = useQuery( {
		queryKey: [ 'a4a-migration-commissions', agencyId ],
		queryFn: () =>
			wpcom.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: `/agency/${ agencyId }/sites`,
				},
				{
					filters: { tags: A4A_MIGRATED_SITE_TAG },
				}
			),
		refetchOnWindowFocus: false,
	} );

	return data;
}
