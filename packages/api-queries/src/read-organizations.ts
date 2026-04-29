import { fetchReaderOrganizations } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readOrganizationsQuery = () => {
	return queryOptions( {
		queryKey: [ 'read', 'organizations' ],
		queryFn: () => fetchReaderOrganizations(),
		staleTime: 5 * 60 * 1000,
	} );
};
