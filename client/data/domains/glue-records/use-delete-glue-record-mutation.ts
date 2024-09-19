import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { domainGlueRecordQueryKey } from 'calypso/data/domains/glue-records/domain-glue-record-query-key';
import wp from 'calypso/lib/wp';
import type {
	GlueRecordObject,
	GlueRecordQueryData,
} from 'calypso/data/domains/glue-records/use-domain-glue-records-query';
import type { DomainsApiError } from 'calypso/lib/domains/types';

export default function useDeleteGlueRecordMutation(
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
						path: `/domains/glue-records/${ domainName }`,
						apiNamespace: 'wpcom/v2',
						method: 'DELETE',
					},
					{
						name_server: glueRecord.nameserver,
					}
				)
				.then( () => glueRecord ),
		...queryOptions,
		onSuccess( glueRecord: GlueRecordObject ) {
			const key = domainGlueRecordQueryKey( domainName );
			queryClient.setQueryData( key, ( old: GlueRecordQueryData ) => {
				if ( ! old ) {
					return [];
				}
				return old.filter( ( item ) => item.nameserver !== glueRecord.nameserver );
			} );
			queryOptions.onSuccess?.();
		},
	} );

	const { mutate } = mutation;

	const deleteGlueRecord = useCallback(
		( glueRecord: GlueRecordObject ) => mutate( glueRecord ),
		[ mutate ]
	);

	return { deleteGlueRecord, ...mutation };
}
