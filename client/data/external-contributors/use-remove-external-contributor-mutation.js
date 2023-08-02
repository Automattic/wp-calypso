import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

function useRemoveExternalContributorMutation() {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { siteId, userId } ) =>
			wp.req.post(
				`/sites/${ siteId }/external-contributors/remove`,
				{
					apiNamespace: 'wpcom/v2',
				},
				{ user_id: userId }
			),
		onSuccess( data, { siteId } ) {
			queryClient.setQueryData( [ 'external-contributors', siteId ], data );
		},
	} );

	const { mutate } = mutation;
	const removeExternalContributor = useCallback(
		( siteId, userId ) => mutate( { siteId, userId } ),
		[ mutate ]
	);

	return { removeExternalContributor, ...mutation };
}

export default useRemoveExternalContributorMutation;
