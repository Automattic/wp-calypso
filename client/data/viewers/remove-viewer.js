/**
 * External dependencies
 */
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

function useRemoveViewer( siteId ) {
	const queryClient = useQueryClient();
	const { mutate: removeViewer, ...rest } = useMutation(
		( viewerId ) => {
			return wp.undocumented().site( siteId ).removeViewer( viewerId );
		},
		{
			onSuccess() {
				queryClient.invalidateQueries( [ 'viewers', siteId ] );
			},
		}
	);

	return { removeViewer, ...rest };
}

export default useRemoveViewer;
