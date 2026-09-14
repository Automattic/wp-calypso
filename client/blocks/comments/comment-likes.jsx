import { pick } from '@automattic/js-utils';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import LikeButton from 'calypso/blocks/like-button/button';
import ReaderLikeIcon from 'calypso/reader/components/icons/like-icon';
import { useCommentLikeMutations } from 'calypso/reader/data/comments';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';

class CommentLikeButtonContainer extends Component {
	constructor() {
		super();
		this.boundHandleLikeToggle = this.handleLikeToggle.bind( this );
	}

	handleLikeToggle( liked ) {
		if ( ! this.props.isLoggedIn ) {
			if ( ! liked ) {
				return;
			}

			return this.props.registerLastActionRequiresLogin( {
				type: 'comment-like',
				siteId: this.props.siteId,
				postId: this.props.postId,
				commentId: this.props.commentId,
			} );
		}
		this.recordLikeToggle( liked );
	}

	recordLikeToggle = ( liked ) => {
		if ( this.props.isLikePending || this.props.isUnlikePending ) {
			return;
		}

		this.props.onLikeToggle( liked );

		if ( liked ) {
			this.props.likeComment( {
				siteId: this.props.siteId,
				postId: this.props.postId,
				commentId: this.props.commentId,
			} );
		} else {
			this.props.unlikeComment( {
				siteId: this.props.siteId,
				postId: this.props.postId,
				commentId: this.props.commentId,
			} );
		}

		recordAction( liked ? 'liked_comment' : 'unliked_comment' );
		recordGaEvent( liked ? 'Clicked Comment Like' : 'Clicked Comment Unlike' );
		this.props.recordReaderTracksEvent(
			'calypso_reader_' + ( liked ? 'liked' : 'unliked' ) + '_comment',
			{
				blog_id: this.props.siteId,
				comment_id: this.props.commentId,
			},
			{
				railcar: this.props.railcar,
			}
		);
	};

	render() {
		const props = pick( this.props, [ 'showZeroCount', 'tagName' ] );
		const likeCount = this.props.comment?.like_count;
		const iLike = this.props.comment?.i_like;
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
	commentId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ).isRequired,
	comment: PropTypes.object.isRequired,
	showZeroCount: PropTypes.bool,
	tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),
	railcar: PropTypes.object,

	// connected props:
	likeComment: PropTypes.func.isRequired,
	unlikeComment: PropTypes.func.isRequired,
	onLikeToggle: PropTypes.func.isRequired,
	isLikePending: PropTypes.bool,
	isUnlikePending: PropTypes.bool,
};

const withCommentLikeMutations = ( WrappedComponent ) => {
	const WithCommentLikeMutations = ( props ) => {
		const commentLikeMutations = useCommentLikeMutations( props.comment );

		return <WrappedComponent { ...props } { ...commentLikeMutations } />;
	};

	WithCommentLikeMutations.displayName = `withCommentLikeMutations(${
		WrappedComponent.displayName || WrappedComponent.name || 'Component'
	})`;

	return WithCommentLikeMutations;
};

export default compose(
	connect(
		( state ) => ( {
			isLoggedIn: isUserLoggedIn( state ),
		} ),
		{ recordReaderTracksEvent, registerLastActionRequiresLogin }
	),
	withCommentLikeMutations
)( CommentLikeButtonContainer );
