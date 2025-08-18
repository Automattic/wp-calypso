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
		onSuccess: ( newData: unknown, createdGlueRecord: DomainGlueRecord ) => {
			queryClient.setQueryData(
				domainGlueRecordsQuery( domainName ).queryKey,
				( oldData: DomainGlueRecord[] = [] ) => oldData.concat( [ createdGlueRecord ] )
			);
			queryClient.invalidateQueries( domainGlueRecordsQuery( domainName ) );
		},
	} );

export const domainGlueRecordUpdateMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( glueRecord: DomainGlueRecord ) => updateDomainGlueRecord( glueRecord ),
		onSuccess: ( newData: unknown, updatedGlueRecord: DomainGlueRecord ) => {
			queryClient.setQueryData(
				domainGlueRecordsQuery( domainName ).queryKey,
				( oldData: DomainGlueRecord[] = [] ) => {
					return oldData.map( ( glueRecord ) => {
						if ( glueRecord.nameserver === updatedGlueRecord.nameserver ) {
							return updatedGlueRecord;
						}

						return glueRecord;
					} );
				}
			);
			queryClient.invalidateQueries( domainGlueRecordsQuery( domainName ) );
		},
	} );

export const domainGlueRecordDeleteMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( glueRecord ) => deleteDomainGlueRecord( domainName, glueRecord ),
		onSuccess: ( newData: unknown, deletedGlueRecord: DomainGlueRecord ): void => {
			queryClient.setQueryData(
				domainGlueRecordsQuery( domainName ).queryKey,
				( oldData: DomainGlueRecord[] = [] ) =>
					oldData.filter( ( glueRecord ) => glueRecord.nameserver !== deletedGlueRecord.nameserver )
			);
			queryClient.invalidateQueries( domainGlueRecordsQuery( domainName ) );
		},
	} );
