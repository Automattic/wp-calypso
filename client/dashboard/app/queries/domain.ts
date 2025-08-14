import { queryOptions } from '@tanstack/react-query';
import { fetchDomain } from '../../data/domain';

export const domainQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName ],
		queryFn: () => fetchDomain( domainName ),
	} );
