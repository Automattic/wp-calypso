// External dependencies
import React from 'react';
import pick from 'lodash/pick';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate } from 'i18n-calypso';

// Internal dependencies
import LikeButton from 'components/like-button/button';
import {
	recordAction,
	recordGaEvent,
	recordTrack
} from 'reader/stats';
import {
	likeComment,
	unlikeComment
} from 'state/comments/actions';
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
			comment_id: this.props.commentId
		} );
	}

	render() {
		const props = pick( this.props, [ 'showZeroCount', 'tagName' ] );
		const likeCount = this.props.commentLike.get( 'like_count' );
		const iLike = this.props.commentLike.get( 'i_like' );
		const likedLabel = translate( 'Liked' );

		return <LikeButton { ...props }
				likeCount={ likeCount }
				liked={ iLike }
				onLikeToggle={ this.boundHandleLikeToggle }
				likedLabel={ likedLabel }
				isMini={ true } />;
	}
}

CommentLikeButtonContainer.propTypes = {
	siteId: React.PropTypes.number.isRequired,
	postId: React.PropTypes.number.isRequired,
	commentId: React.PropTypes.number.isRequired,
	showZeroCount: React.PropTypes.bool,
	tagName: React.PropTypes.string,

	// connected props:
	commentLike: React.PropTypes.object.isRequired, // Immutable.Map
	likeComment: React.PropTypes.func.isRequired,
	unlikeComment: React.PropTypes.func.isRequired
};

export default connect(
	( state, props ) => ( {
		commentLike: getCommentLike( state, props.siteId, props.postId, props.commentId )
	} ),
	( dispatch ) => bindActionCreators( {
		likeComment,
		unlikeComment
	}, dispatch )
)( CommentLikeButtonContainer );
