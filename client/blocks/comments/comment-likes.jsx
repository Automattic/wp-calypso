/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { get, pick } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import LikeButton from 'blocks/like-button/button';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { likeComment, unlikeComment } from 'state/comments/actions';
import { getCommentLike } from 'state/comments/selectors';

class CommentLikeButtonContainer extends React.Component {
	constructor() {
		super();
		this.boundHandleLikeToggle = this.handleLikeToggle.bind( this );
	}

	handleLikeToggle( liked ) {
		if ( liked ) {
			this.props.likeComment( this.props.siteId, this.props.postId, this.props.commentId );
		} else {
			this.props.unlikeComment( this.props.siteId, this.props.postId, this.props.commentId );
		}

		recordAction( liked ? 'liked_comment' : 'unliked_comment' );
		recordGaEvent( liked ? 'Clicked Comment Like' : 'Clicked Comment Unlike' );
		recordTrack( 'calypso_reader_' + ( liked ? 'liked' : 'unliked' ) + '_comment', {
			blog_id: this.props.siteId,
			comment_id: this.props.commentId,
		} );
	}

	render() {
		const props = pick( this.props, [ 'showZeroCount', 'tagName' ] );
		const likeCount = get( this.props.commentLike, 'like_count' );
		const iLike = get( this.props.commentLike, 'i_like' );
		const likedLabel = translate( 'Liked' );

		return (
			<LikeButton
				{ ...props }
				likeCount={ likeCount }
				liked={ iLike }
				onLikeToggle={ this.boundHandleLikeToggle }
				likedLabel={ likedLabel }
				iconSize={ 18 }
			/>
		);
	}
}

CommentLikeButtonContainer.propTypes = {
	siteId: PropTypes.number.isRequired,
	postId: PropTypes.number.isRequired,
	commentId: PropTypes.number.isRequired,
	showZeroCount: PropTypes.bool,
	tagName: PropTypes.string,

	// connected props:
	commentLike: PropTypes.object,
	likeComment: PropTypes.func.isRequired,
	unlikeComment: PropTypes.func.isRequired,
};

export default connect(
	( state, props ) => ( {
		commentLike: getCommentLike( state, props.siteId, props.postId, props.commentId ),
	} ),
	( dispatch ) =>
		bindActionCreators(
			{
				likeComment,
				unlikeComment,
			},
			dispatch
		)
)( CommentLikeButtonContainer );
