import { UseQueryResult, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { domainGlueRecordQueryKey } from './domain-glue-record-query-key';

export type GlueRecordResponse = GlueRecordObject[] | null;

export type GlueRecordObject = {
	record: string;
	address: string;
};

export type GlueRecordApiObject = {
	nameserver: string;
	ip_addresses: string[];
};

const selectGlueRecords = ( response: GlueRecordApiObject[] | null ): GlueRecordResponse => {
	if ( ! response ) {
		return null;
	}

	return response?.map( ( record: GlueRecordApiObject ) => {
		return {
			record: record.nameserver,
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
	} );
}
