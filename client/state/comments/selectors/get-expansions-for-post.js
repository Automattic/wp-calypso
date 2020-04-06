/**
 * Internal dependencies
 */
import { getStateKey } from 'state/comments/utils';

import 'state/comments/init';

export function getExpansionsForPost( state, siteId, postId ) {
	return state.comments.expansions[ getStateKey( siteId, postId ) ];
}
