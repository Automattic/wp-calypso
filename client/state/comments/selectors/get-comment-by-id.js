import { deconstructStateKey, getErrorKey } from 'calypso/state/comments/utils';

import 'calypso/state/comments/init';

export function getCommentById( { state, commentId, siteId } ) {
	const errorKey = getErrorKey( siteId, commentId );
	if ( state.comments.errors[ errorKey ] ) {
		return state.comments.errors[ errorKey ];
	}

	const commentsForSite = Object.entries( state.comments.items ?? {} ).flatMap(
		( [ key, comments ] ) => ( deconstructStateKey( key ).siteId === siteId ? comments : [] )
	);
	return commentsForSite.find( ( comment ) => commentId === comment.ID );
}
