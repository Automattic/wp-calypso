import { queryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export const domainDnsRecordsQuery = ( domain: string ) =>
	queryOptions( {
		queryKey: [ 'domain', domain, 'dns-records' ],
		queryFn: () => wpcom.req.get( `/domains/${ domain }/dns` ),
	} );
