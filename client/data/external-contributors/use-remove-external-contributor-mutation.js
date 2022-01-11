import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';

function useRemoveExternalContributorMutation() {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { siteId, userId } ) =>
			wp.req.post(
				`/sites/${ siteId }/external-contributors/remove`,
				{
					apiNamespace: 'wpcom/v2',
				},
				{ user_id: userId }
			),
		{
			onSuccess( data, { siteId } ) {
				queryClient.invalidateQueries( [ 'external-contributors', siteId ] );
			},
		}
	);

	const { mutate } = mutation;
	const removeExternalContributor = useCallback(
		( siteId, userId ) => mutate( { siteId, userId } ),
		[ mutate ]
	);

	return { removeExternalContributor, ...mutation };
}

export default useRemoveExternalContributorMutation;
