import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { MigrationCommissionItem } from '../types';

export const getMigrationCommissionsQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-migration-commissions', agencyId ];
};

// FIXME: Replace 'any' with the correct type once the API is implemented
const getMigrationCommissions = ( commissions: any ): MigrationCommissionItem[] => {
	return commissions.map( ( commission: any ) => {
		return {
			id: commission.blog_id,
			siteUrl: commission.site_url,
			migratedOn: new Date( commission.migrated_on ),
			reviewStatus: commission.review_status,
		};
	} );
};

export default function useFetchMigrationCommissions() {
	const agencyId = useSelector( getActiveAgencyId );

	const isAPIEnabled = false; // Remove this line once the API is implemented

	const data = useQuery( {
		// Since, we will be removing the hardcoded data, we need not pass the isAPIEnabled as a dependency
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: getMigrationCommissionsQueryKey( agencyId ),
		queryFn: () =>
			isAPIEnabled
				? wpcom.req.get( {
						apiNamespace: 'wpcom/v2',
						path: `/agency/${ agencyId }/migrations/commissions`, // FIXME: Replace with the correct API path
				  } )
				: [
						{
							blog_id: 1,
							site_url: 'site1.com',
							migrated_on: '2024-10-14 13:14:22',
							review_status: 'confirmed',
						},
						{
							blog_id: 2,
							site_url: 'site4.com',
							migrated_on: '2024-06-14 13:14:22',
							review_status: 'confirmed',
						},
						{
							blog_id: 3,
							site_url: 'site2.com',
							migrated_on: '2024-06-14 13:14:22',
							review_status: 'pending',
						},
						{
							blog_id: 4,
							site_url: 'site2.com',
							migrated_on: '2024-06-14 13:14:22',
							review_status: 'pending',
						},
						{
							blog_id: 5,
							site_url: 'site5.com',
							migrated_on: '2024-06-14 13:14:22',
							review_status: 'rejected',
						},
				  ], // Remove this line once the API is implemented
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		select: getMigrationCommissions,
	} );

	return data;
}
