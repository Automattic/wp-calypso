import { queryOptions, mutationOptions } from '@tanstack/react-query';
import {
	DomainGlueRecord,
	fetchDomainGlueRecords,
	createDomainGlueRecord,
	updateDomainGlueRecord,
	deleteDomainGlueRecord,
} from '../../data/domain-glue-records';
import { queryClient } from '../query-client';

export const domainGlueRecordsQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'domain-glue-records' ],
		queryFn: () => fetchDomainGlueRecords( domainName ),
	} );

export const domainGlueRecordCreateMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( glueRecord: DomainGlueRecord ) => createDomainGlueRecord( glueRecord ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainGlueRecordsQuery( domainName ) );
		},
	} );

export const domainGlueRecordUpdateMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( glueRecord: DomainGlueRecord ) => updateDomainGlueRecord( glueRecord ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainGlueRecordsQuery( domainName ) );
		},
	} );

export const domainGlueRecordDeleteMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( nameServer: string ) => deleteDomainGlueRecord( domainName, nameServer ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainGlueRecordsQuery( domainName ) );
		},
	} );
