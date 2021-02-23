/**
 * External dependencies
 */
import { useMutation } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

function useDeleteUser( siteId ) {
	const { mutate: deleteUser, ...rest } = useMutation( ( { userId, reassignUserId } ) => {
		const variables = {};
		if ( reassignUserId ) {
			variables.reassign = reassignUserId;
		}
		return wp.undocumented().site( siteId ).deleteUser( userId, variables );
	} );

	return { deleteUser, ...rest };
}

export default useDeleteUser;
