/**
 * External dependencies
 */
import { filter, find, flatMap } from 'lodash';

/**
 * Internal dependencies
 */
import { deconstructStateKey, getErrorKey } from 'calypso/state/comments/utils';

import 'calypso/state/comments/init';

export function getCommentById( { state, commentId, siteId } ) {
	const errorKey = getErrorKey( siteId, commentId );
	if ( state.comments.errors[ errorKey ] ) {
		return state.comments.errors[ errorKey ];
	}

	const commentsForSite = flatMap(
		filter( state.comments.items, ( comment, key ) => {
			return deconstructStateKey( key ).siteId === siteId;
		} )
	);
	return find( commentsForSite, ( comment ) => commentId === comment.ID );
}
