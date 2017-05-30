/**
 * Internal dependencies
 */
import { AnonymousUser, WordPressUser } from './models/comment-author';
import { CommentInfo } from './models/comment-info';
import { Approved, Pending, Spam, Trash } from './models/comment-status';
import { LoadedComment, LoadingComment } from './models/comment';

const toAuthor = ( { avatar_URL, email, ID, name } ) =>
	ID > 0
		? new WordPressUser( ID )
		: new AnonymousUser( { avatar: avatar_URL, displayName: name, email, url: URL } );

const toStatus = text => {
	switch ( text ) {
		case 'approved': return new Approved();
		case 'spam': return new Spam();
		case 'trash': return new Trash();
		case 'unapproved': return new Pending();
		default: return new Pending();
	}
};

const toInfo = ( { content, date, i_like, parent, status } ) => {
	return new CommentInfo( {
		content,
		createdAt: Date.parse( date ),
		isLiked: i_like,
		parentId: parent ? parent.ID : 0,
		status: toStatus( status ),
	} );
};

export const fromApi = ( siteId, comment ) => {
	if ( ! comment.content ) {
		return new LoadingComment( siteId, comment.ID );
	}

	return new LoadedComment( {
		siteId,
		postId: comment.post.ID,
		commentId: comment.ID,
		author: toAuthor( comment.author ),
		info: toInfo( comment ),
	} );
};
