/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

function useRemoveExternalContributorMutation( siteId ) {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { userId } ) =>
			wp.req.post(
				{
					path: `/sites/${ siteId }/external-contributors/remove`,
					apiNamespace: 'wpcom/v2',
				},
				{ user_id: userId }
			),
		{
			onSuccess() {
				queryClient.invalidateQueries( [ 'external-contributors', siteId ] );
			},
		}
	);
	const { mutate } = mutation;

	const removeExternalContributor = useCallback( ( userId ) => mutate( { userId } ), [ mutate ] );

	return { removeExternalContributor, ...mutation };
}

export default useRemoveExternalContributorMutation;
