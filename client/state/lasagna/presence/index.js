/**
 * External dependencies
 */
import { Presence } from 'phoenix';

/**
 * Internal dependencies
 */
import { updateUsersViewingPostCount } from 'state/posts/actions';

export default ( channel, store, globalId ) => {
	const presence = new Presence( channel );
	presence.onSync( () => {
		const presenceCount = presence.list().length;
		//store.dispatch( updateUsersViewingPostCount( globalId, presenceCount ) );
	} );
};
