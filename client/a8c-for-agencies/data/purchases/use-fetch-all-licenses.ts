import { useQuery } from '@tanstack/react-query';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import formatLicenses from './lib/format-licenses';

export const getFetchLicensesQueryKey = (
	filter: LicenseFilter,
	search: string,
	sortField: LicenseSortField,
	sortDirection: LicenseSortDirection,
	agencyId?: number
) => {
	return [ 'a4a-all-licenses', filter, search, sortField, sortDirection, agencyId ];
};

const FETCH_SIZE = 100;

export default function useFetchAllLicenses(
	filter: LicenseFilter,
	search: string,
	sortField: LicenseSortField,
	sortDirection: LicenseSortDirection
) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: getFetchLicensesQueryKey( filter, search, sortField, sortDirection, agencyId ),
		queryFn: async () => {
			let currentPage = 1;
			let hasMorePages = true;
			const licenses = [];

			while ( hasMorePages ) {
				const response = await wpcom.req.get(
					{
						apiNamespace: 'wpcom/v2',
						path: '/jetpack-licensing/licenses',
					},
					{
						...( agencyId && { agency_id: agencyId } ),
						...( search && { search: search } ),
						filter: filter,
						page: currentPage,
						sort_field: sortField,
						sort_direction: sortDirection,
						per_page: FETCH_SIZE,
					}
				);

				licenses.push( ...response.items );

				hasMorePages = currentPage < response.total_pages;
				currentPage++;
			}

			return {
				items: formatLicenses( licenses ),
				total: licenses.length,
			};
		},
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
