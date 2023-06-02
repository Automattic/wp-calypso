import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

function useAddExternalContributorMutation() {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { siteId, userId } ) =>
			wp.req.post(
				`/sites/${ siteId }/external-contributors/add`,
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
	const addExternalContributor = useCallback(
		( siteId, userId ) => mutate( { siteId, userId } ),
		[ mutate ]
	);

	return { addExternalContributor, ...mutation };
}

export default useAddExternalContributorMutation;
