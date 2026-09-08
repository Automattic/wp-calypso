import { EDITOR_STOP } from 'calypso/state/action-types';

import 'calypso/state/editor/init';

/**
 * Returns an action object to be used in signalling that the editor should
 * stop editing.
 * @param  {number}  siteId Site ID
 * @param  {?number} postId Post ID
 * @returns {any}         Action object
 */
export function stopEditingPost( siteId, postId ) {
	return {
		type: EDITOR_STOP,
		siteId,
		postId,
	};
}
