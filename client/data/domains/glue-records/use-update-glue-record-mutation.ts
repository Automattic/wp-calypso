import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { domainGlueRecordQueryKey } from 'calypso/data/domains/glue-records/domain-glue-record-query-key';
import { DomainsApiError } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';
import {
	GlueRecordObject,
	GlueRecordQueryData,
	mapGlueRecordObjectToApiObject,
} from './use-domain-glue-records-query';

export default function useUpdateGlueRecordMutation(
	domainName: string,
	queryOptions: {
		onSuccess?: () => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( glueRecord: GlueRecordObject ) =>
			wp.req
				.post(
					{
						path: `/domains/glue-records`,
						apiNamespace: 'wpcom/v2',
					},
					{
						name_server: glueRecord.record,
						ip_addresses: [ glueRecord.address ],
					}
				)
				.then( () => glueRecord ),
		...queryOptions,
		onSuccess( glueRecord: GlueRecordObject ) {
			const key = domainGlueRecordQueryKey( domainName );
			queryClient.setQueryData( key, ( old: GlueRecordQueryData ) => {
				if ( ! old ) {
					return [ mapGlueRecordObjectToApiObject( glueRecord ) ];
				}
				return [ ...old, mapGlueRecordObjectToApiObject( glueRecord ) ];
			} );
			queryOptions.onSuccess?.();
		},
		onError( error: DomainsApiError ) {
			queryOptions.onError?.( error );
		},
	} );

	const { mutate } = mutation;

	const updateGlueRecord = useCallback(
		( glueRecord: GlueRecordObject ) => mutate( glueRecord ),
		[ mutate ]
	);

	return { updateGlueRecord, ...mutation };
}
