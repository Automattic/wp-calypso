import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

function useRemoveViewer() {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { siteId, viewerId } ) => {
			return wp.req.post( `/sites/${ siteId }/viewers/${ viewerId }/delete` );
		},
		onSuccess( data, variables ) {
			const { siteId } = variables;
			queryClient.invalidateQueries( {
				queryKey: [ 'viewers', siteId ],
			} );
		},
	} );

	const { mutate } = mutation;
	const removeViewer = useCallback(
		( siteId, viewerId ) => mutate( { siteId, viewerId } ),
		[ mutate ]
	);

	return { removeViewer, ...mutation };
}

export default useRemoveViewer;
