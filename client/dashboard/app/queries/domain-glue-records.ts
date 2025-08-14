import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { deleteDomainGlueRecord, fetchDomainGlueRecords } from '../../data/domain-glue-records';
import { queryClient } from '../query-client';

export const domainGlueRecordsQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'domain-glue-records' ],
		queryFn: () => fetchDomainGlueRecords( domainName ),
	} );

export const domainGlueRecordDeleteMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( nameServer: string ) => deleteDomainGlueRecord( domainName, nameServer ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainGlueRecordsQuery( domainName ) );
		},
	} );
