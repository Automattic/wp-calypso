/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { likeComment, unlikeComment } from 'state/comments/actions';
import { getCommentLike } from 'state/comments/selectors';

const getLabel = ( i_like, like_count, translate ) => {
	if ( like_count === 0 ) {
		return translate( 'Like', {
			context: 'verb: imperative',
			comment: 'Label for a button to "like" a post.',
		} );
	}

	if ( i_like && like_count === 1 ) {
		return translate( 'Liked', { comment: 'Displayed when a person "likes" a post.' } );
	}

	return translate( 'Like', 'Likes', {
		count: like_count,
		context: 'noun',
		comment: 'Number of likes.',
	} );
};

export const CommentLikes = ( {
	commentLike,
	dispatchLike,
	dispatchUnlike,
	translate,
} ) => {
	const { i_like, like_count } = commentLike;
	const likeLabel = getLabel( i_like, like_count, translate );
	const showLikeCount = ( i_like && like_count > 1 ) || ( ! i_like && like_count > 0 );

	return (
		<a
			className={ classnames( 'comment-detail__action-like', { 'is-liked': i_like } ) }
			onClick={ i_like ? dispatchUnlike : dispatchLike }
		>
			<Gridicon icon={ i_like ? 'star' : 'star-outline' } />
			<span>{ showLikeCount ? like_count + ' ' : '' }{ likeLabel }</span>
		</a>
	);
};

const mapStateToProps = ( state, { siteId, postId, commentId } ) => ( {
	commentLike: getCommentLike( state, siteId, postId, commentId )
} );

const mapDispatchToProps = ( dispatch, { siteId, postId, commentId } ) => ( {
	dispatchLike: () => dispatch( likeComment( siteId, postId, commentId ) ),
	dispatchUnlike: () => dispatch( unlikeComment( siteId, postId, commentId ) )
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentLikes ) );
