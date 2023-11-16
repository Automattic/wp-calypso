import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { domainGlueRecordQueryKey } from 'calypso/data/domains/glue-records/domain-glue-record-query-key';
import { DomainsApiError } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';

export default function useDeleteGlueRecordMutation(
	domainName: string,
	queryOptions: {
		onSuccess?: () => void;
		onError?: ( error: DomainsApiError ) => void;
	}
) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( glueRecord: string ) =>
			wp.req.post(
				{
					path: `/domains/glue-records/${ domainName }`,
					apiNamespace: 'wpcom/v2',
					method: 'DELETE',
				},
				{
					name_server: glueRecord,
				}
			),
		...queryOptions,
		onSuccess() {
			queryClient.removeQueries( domainGlueRecordQueryKey( domainName ) );
			queryOptions.onSuccess?.();
		},
	} );

	const { mutate } = mutation;

	const deleteGlueRecord = useCallback(
		( glueRecord: string ) => mutate( glueRecord ),
		[ mutate ]
	);

	return { deleteGlueRecord, ...mutation };
}
