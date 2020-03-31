/**
 * Internal dependencies
 */
import 'state/presence/init';

export const getPostPresenceCount = ( state, globalId ) => {
	return state.presence.items.posts[ globalId ] || 0;
};
