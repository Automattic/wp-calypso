import { getCalypsoQueryClient } from 'calypso/state/query-client';

/**
 * Invalidates the read list items query for a specific user and list.
 */
export function invalidateUserListItemsQuery( userLogin: string, listName: string ): void {
	getCalypsoQueryClient()?.invalidateQueries( {
		queryKey: [ 'read', 'lists', userLogin, listName, 'items' ],
	} );
}
