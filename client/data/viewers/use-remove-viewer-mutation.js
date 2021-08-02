import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';

function useRemoveViewer() {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { siteId, viewerId } ) => {
			return wp.req.post( `/sites/${ siteId }/viewers/${ viewerId }/delete` );
		},
		{
			onSuccess( data, variables ) {
				const { siteId } = variables;
				queryClient.invalidateQueries( [ 'viewers', siteId ] );
			},
		}
	);

	const { mutate } = mutation;
	const removeViewer = useCallback( ( siteId, viewerId ) => mutate( { siteId, viewerId } ), [
		mutate,
	] );

	return { removeViewer, ...mutation };
}

export default useRemoveViewer;
