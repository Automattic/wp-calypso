import { queryOptions } from '@tanstack/react-query';
import { fetchDomainGlueRecords } from '../../data/domain-glue-records';

export const domainGlueRecordsQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'domain-glue-records' ],
		queryFn: () => fetchDomainGlueRecords( domainName ),
	} );
