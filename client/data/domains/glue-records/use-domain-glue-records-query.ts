import { UseQueryResult, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { domainGlueRecordQueryKey } from './domain-glue-record-query-key';

export type Maybe< T > = T | null | undefined;
export type GlueRecordResponse = GlueRecordObject[] | null | undefined;

export type GlueRecordObject = {
	record: string;
	address: string;
};

export type GlueRecordQueryData = Maybe< GlueRecordApiObject[] >;

export type GlueRecordApiObject = {
	nameserver: string;
	ip_addresses: string[];
};

export const mapGlueRecordObjectToApiObject = ( record: GlueRecordObject ): GlueRecordApiObject => {
	return {
		nameserver: record.record.toLowerCase(),
		ip_addresses: [ record.address ],
	};
};

const selectGlueRecords = ( response: GlueRecordApiObject[] | null ): GlueRecordResponse => {
	if ( ! response ) {
		return null;
	}

	return response?.map( ( record: GlueRecordApiObject ) => {
		return {
			record: record.nameserver.toLowerCase(),
			address: record.ip_addresses[ 0 ],
		};
	} );
};

export default function useDomainGlueRecordsQuery(
	domainName: string
): UseQueryResult< GlueRecordResponse > {
	return useQuery( {
		queryKey: domainGlueRecordQueryKey( domainName ),
		queryFn: () =>
			wp.req.get( {
				path: `/domains/glue-records/${ domainName }`,
				apiNamespace: 'wpcom/v2',
			} ),
		refetchOnWindowFocus: false,
		select: selectGlueRecords,
		enabled: false,
		staleTime: 5 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	} );
}
