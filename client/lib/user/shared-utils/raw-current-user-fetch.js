/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export function rawCurrentUserFetch() {
	return wpcom.me().get( {
		meta: 'flags',
	} );
}
