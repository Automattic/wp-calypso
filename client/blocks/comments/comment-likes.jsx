import { translate } from 'i18n-calypso';
import { get, pick } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import LikeButton from 'calypso/blocks/like-button/button';
import ReaderLikeIcon from 'calypso/reader/components/icons/like-icon';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { likeComment, unlikeComment } from 'calypso/state/comments/actions';
import { getCommentLike } from 'calypso/state/comments/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { registerLastLoggedInAction } from 'calypso/state/reader-ui/actions';

class CommentLikeButtonContainer extends Component {
	constructor() {
		super();
		this.boundHandleLikeToggle = this.handleLikeToggle.bind( this );
	}

	handleLikeToggle( liked ) {
		const likeAction = {
			type: liked ? 'like' : 'unlike',
			siteId: this.props.siteId,
			postId: this.props.postId,
			commentId: this.props.commentId,
		};
		this.props.registerLastLoggedInAction( likeAction );
		if ( this.props.isLoggedIn ) {
			this.recordLikeToggle( liked );
		}
		this.props.onLikeToggle( liked );
	}

	recordLikeToggle = ( liked ) => {
		if ( liked ) {
			this.props.likeComment( this.props.siteId, this.props.postId, this.props.commentId );
		} else {
			this.props.unlikeComment( this.props.siteId, this.props.postId, this.props.commentId );
		}

		recordAction( liked ? 'liked_comment' : 'unliked_comment' );
		recordGaEvent( liked ? 'Clicked Comment Like' : 'Clicked Comment Unlike' );
		this.props.recordReaderTracksEvent(
			'calypso_reader_' + ( liked ? 'liked' : 'unliked' ) + '_comment',
			{
				blog_id: this.props.siteId,
				comment_id: this.props.commentId,
			}
		);
	};

	render() {
		const props = pick( this.props, [ 'showZeroCount', 'tagName' ] );
		const likeCount = get( this.props.commentLike, 'like_count' );
		const iLike = get( this.props.commentLike, 'i_like' );
		const likedLabel = translate( 'Liked' );

		const likeIcon = ReaderLikeIcon( {
			liked: iLike,
			iconSize: 18,
		} );

		return (
			<LikeButton
				{ ...props }
				likeCount={ likeCount }
				liked={ iLike }
				onLikeToggle={ this.boundHandleLikeToggle }
				likedLabel={ likedLabel }
				iconSize={ 18 }
				icon={ likeIcon }
				defaultLabel={ translate( 'Like' ) }
			/>
		);
	}
}

CommentLikeButtonContainer.propTypes = {
	siteId: PropTypes.number.isRequired,
	postId: PropTypes.number.isRequired,
	commentId: PropTypes.number.isRequired,
	showZeroCount: PropTypes.bool,
	tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),

	// connected props:
	commentLike: PropTypes.object,
	likeComment: PropTypes.func.isRequired,
	unlikeComment: PropTypes.func.isRequired,
	onLikeToggle: PropTypes.func.isRequired,
};

export default connect(
	( state, props ) => ( {
		commentLike: getCommentLike( state, props.siteId, props.postId, props.commentId ),
		isLoggedIn: isUserLoggedIn( state ),
	} ),
	{ likeComment, recordReaderTracksEvent, unlikeComment, registerLastLoggedInAction }
)( CommentLikeButtonContainer );
