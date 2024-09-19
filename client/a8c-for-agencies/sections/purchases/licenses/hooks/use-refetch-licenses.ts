import { useQueryClient } from '@tanstack/react-query';
import { Context, useContext } from 'react';
import { getFetchLicenseCountsQueryKey } from 'calypso/a8c-for-agencies/data/purchases/use-fetch-license-counts';
import { getFetchLicensesQueryKey } from 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { LicenseListContext } from 'calypso/state/partner-portal/types';
import { LICENSES_PER_PAGE } from '../../lib/constants';

export default function useRefetchLicenses( context: Context< LicenseListContext > ) {
	const agencyId = useSelector( getActiveAgencyId );

	const queryClient = useQueryClient();

	const { filter, search, sortField, sortDirection, currentPage } = useContext( context );

	const refetchLicenses = () => {
		// Invalidate the queries for the license counts and the licenses to refetch the data
		queryClient.invalidateQueries( {
			queryKey: getFetchLicenseCountsQueryKey( agencyId ),
		} );
		queryClient.invalidateQueries( {
			queryKey: getFetchLicensesQueryKey(
				filter,
				search,
				sortField,
				sortDirection,
				currentPage,
				LICENSES_PER_PAGE,
				agencyId
			),
		} );
	};

	return refetchLicenses;
}
