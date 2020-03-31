/**
 * External dependencies
 */
import { Presence } from 'phoenix';

/**
 * Internal dependencies
 */
import { setPresenceMeta } from 'state/presence/actions';

export default ( channel, store, entity, uid ) => {
	const presence = new Presence( channel );
	presence.onSync( () => {
		store.dispatch( setPresenceMeta( entity, uid, presence.list().length ) );
	} );
};
