import { likeSiteCommentMutation, unlikeSiteCommentMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { flowRight, get, pick } from 'lodash';
import PropTypes from 'prop-types';
import { Component, useCallback } from 'react';
import { connect } from 'react-redux';
import LikeButton from 'calypso/blocks/like-button/button';
import ReaderLikeIcon from 'calypso/reader/components/icons/like-icon';
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
			return this.props.registerLastActionRequiresLogin( {
				type: liked ? 'comment-like' : 'comment-unlike',
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
			},
			{
				railcar: this.props.railcar,
			}
		);
	};

	render() {
		const props = pick( this.props, [ 'showZeroCount', 'tagName' ] );
		const likeCount = get( this.props.comment, 'like_count' );
		const iLike = get( this.props.comment, 'i_like' );
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
	const WithCommentLikeMutations = ( { siteId, postId, commentId, ...props } ) => {
		const { mutate: likeComment, isPending: isLikePending } = useMutation(
			likeSiteCommentMutation()
		);
		const { mutate: unlikeComment, isPending: isUnlikePending } = useMutation(
			unlikeSiteCommentMutation()
		);
		const handleLikeComment = useCallback(
			() => likeComment( { siteId, postId, commentId } ),
			[ commentId, likeComment, postId, siteId ]
		);
		const handleUnlikeComment = useCallback(
			() => unlikeComment( { siteId, postId, commentId } ),
			[ commentId, postId, siteId, unlikeComment ]
		);

		return (
			<WrappedComponent
				{ ...props }
				siteId={ siteId }
				postId={ postId }
				commentId={ commentId }
				likeComment={ handleLikeComment }
				unlikeComment={ handleUnlikeComment }
				isLikePending={ isLikePending }
				isUnlikePending={ isUnlikePending }
			/>
		);
	};

	WithCommentLikeMutations.displayName = `withCommentLikeMutations(${
		WrappedComponent.displayName || WrappedComponent.name || 'Component'
	})`;

	return WithCommentLikeMutations;
};

export default flowRight(
	connect(
		( state ) => ( {
			isLoggedIn: isUserLoggedIn( state ),
		} ),
		{ recordReaderTracksEvent, registerLastActionRequiresLogin }
	),
	withCommentLikeMutations
)( CommentLikeButtonContainer );
