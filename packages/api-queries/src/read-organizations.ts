import { fetchReaderOrganizations } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readOrganizationsQuery = () => {
	return queryOptions( {
		queryKey: [ 'read', 'organizations' ],
		queryFn: () => fetchReaderOrganizations(),
	} );
};
