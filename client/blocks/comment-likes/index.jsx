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
import Button from 'components/button';
import { likeComment, unlikeComment } from 'state/comments/actions';
import { getCommentLike } from 'state/comments/selectors';

const getLabel = ( i_like, like_count, translate ) => {
	if ( i_like && like_count === 1 ) {
		return translate( 'Liked', { comment: 'Displayed when a person "likes" a post.' } );
	}

	if ( like_count === 0 ) {
		return translate( 'Like', {
			context: 'verb: imperative',
			comment: 'Label for a button to "like" a post.',
		} );
	}

	return translate( '%(like_count)d Like', '%(like_count)d Likes', {
		count: like_count,
		args: { like_count },
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

	return (
		<Button
			borderless
			className={ classnames( 'comment-detail__action-like', { 'is-liked': i_like } ) }
			onClick={ i_like ? dispatchUnlike : dispatchLike }
		>
			<Gridicon icon={ i_like ? 'star' : 'star-outline' } />
			<span>{ getLabel( i_like, like_count, translate ) }</span>
		</Button>
	);
};

const mapStateToProps = ( state, { siteId, postId, commentId } ) => ( {
	commentLike: getCommentLike( state, siteId, postId, commentId )
} );

const mapDispatchToProps = ( dispatch, { siteId, postId, commentId, commentStatus } ) => ( {
	dispatchLike: () => dispatch( likeComment( siteId, postId, commentId, commentStatus ) ),
	dispatchUnlike: () => dispatch( unlikeComment( siteId, postId, commentId ) )
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentLikes ) );
