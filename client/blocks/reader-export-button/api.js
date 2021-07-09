/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

export async function exportReaderList( listId ) {
	const result = await wp.req.get( `/read/lists/${ listId }/export`, { apiNamespace: 'wpcom/v2' } );
	return result;
}

export async function exportReaderSubscriptions() {
	const result = await wp.req.get( `/read/following/mine/export`, {
		apiVersion: '1.2',
	} );
	return result;
}
