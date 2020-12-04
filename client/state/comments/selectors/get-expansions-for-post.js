/**
 * Internal dependencies
 */
import { getStateKey } from 'calypso/state/comments/utils';

import 'calypso/state/comments/init';

export function getExpansionsForPost( state, siteId, postId ) {
	return state.comments.expansions[ getStateKey( siteId, postId ) ];
}
