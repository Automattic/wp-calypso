import { filter, find } from 'lodash';
import { deconstructStateKey, getErrorKey } from 'calypso/state/comments/utils';

import 'calypso/state/comments/init';

export function getCommentById( { state, commentId, siteId } ) {
	const errorKey = getErrorKey( siteId, commentId );
	if ( state.comments.errors[ errorKey ] ) {
		return state.comments.errors[ errorKey ];
	}

	const commentsForSite = filter( state.comments.items, ( comment, key ) => {
		return deconstructStateKey( key ).siteId === siteId;
	} ).flat();
	return find( commentsForSite, ( comment ) => commentId === comment.ID );
}
