/**
 * External dependencies
 */
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

function useRemoveViewer() {
	const queryClient = useQueryClient();
	const { mutate: removeViewer, ...rest } = useMutation(
		( { siteId, viewerId } ) => {
			return wp.undocumented().site( siteId ).removeViewer( viewerId );
		},
		{
			onSuccess( data, variables ) {
				const { siteId } = variables;
				queryClient.invalidateQueries( [ 'viewers', siteId ] );
			},
		}
	);

	return { removeViewer, ...rest };
}

export default useRemoveViewer;
