import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { createRef, Component, Fragment } from 'react';
import { connect } from 'react-redux';
import LikeButtonContainer from 'calypso/blocks/like-button';
import PostLikesPopover from 'calypso/blocks/post-likes/popover';
import ReaderJoinConversationDialog from 'calypso/blocks/reader-join-conversation/dialog';
import QueryPostLikes from 'calypso/components/data/query-post-likes';
import { navigate } from 'calypso/lib/navigate';
import { createAccountUrl } from 'calypso/lib/paths';
import ReaderLikeIcon from 'calypso/reader/components/icons/like-icon';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getPostLikeCount } from 'calypso/state/posts/selectors/get-post-like-count';
import { isLikedPost } from 'calypso/state/posts/selectors/is-liked-post';
import { markPostSeen } from 'calypso/state/reader/posts/actions';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import './style.scss';

class ReaderLikeButton extends Component {
	state = {
		showLikesPopover: false,
		showJoinConversationModal: false,
	};

	hidePopoverTimeout = null;
	likeButtonRef = createRef();

	componentWillUnmount() {
		clearTimeout( this.hidePopoverTimeout );
	}

	onLoggedOut = () => {
		if ( config.isEnabled( 'reader/login-window' ) ) {
			return this.showJoinConversationModal();
		}
		// Redirect to create account page
		const { pathname } = getUrlParts( window.location.href );
		return navigate( createAccountUrl( { redirectTo: pathname, ref: 'reader-lp' } ) );
	};

	recordLikeToggle = ( liked ) => {
		const post = this.props.post || this.props.postByKey;

		recordAction( liked ? 'liked_post' : 'unliked_post' );
		recordGaEvent( liked ? 'Clicked Like Post' : 'Clicked Unlike Post' );
		recordTrackForPost(
			liked ? 'calypso_reader_article_liked' : 'calypso_reader_article_unliked',
			post,
			{ context: this.props.fullPost ? 'full-post' : 'card' }
		);
		if ( liked && ! this.props.fullPost && ! post._seen ) {
			this.props.markPostSeen( post, this.props.site );
		}
	};

	hideJoinConversationModal = () => {
		this.setState( { showJoinConversationModal: false } );
	};

	showJoinConversationModal = () => {
		this.setState( { showJoinConversationModal: true } );
	};

	showLikesPopover = () => {
		clearTimeout( this.hidePopoverTimeout );
		this.setState( { showLikesPopover: true } );
	};

	hideLikesPopover = () => {
		this.hidePopoverTimeout = setTimeout( () => {
			this.setState( { showLikesPopover: false } );
		}, 200 );
	};

	render() {
		const { siteId, postId, likeCount, iLike, iconSize } = this.props;
		const { showLikesPopover, showJoinConversationModal } = this.state;
		const hasEnoughLikes = ( likeCount > 0 && ! iLike ) || ( likeCount > 1 && iLike );

		const likeIcon = ReaderLikeIcon( {
			liked: iLike,
			iconSize: iconSize,
		} );

		return (
			<Fragment>
				<QueryPostLikes siteId={ siteId } postId={ postId } />
				<LikeButtonContainer
					{ ...this.props }
					ref={ this.likeButtonRef }
					onMouseEnter={ this.showLikesPopover }
					onMouseLeave={ this.hideLikesPopover }
					onLikeToggle={ this.recordLikeToggle }
					onLoggedOut={ this.onLoggedOut }
					likeSource="reader"
					icon={ likeIcon }
				/>
				{ showLikesPopover && siteId && postId && hasEnoughLikes && (
					<PostLikesPopover
						className="reader-likes-popover ignore-click" // eslint-disable-line wpcalypso/jsx-classname-namespace
						onMouseEnter={ this.showLikesPopover }
						onMouseLeave={ this.hideLikesPopover }
						siteId={ siteId }
						postId={ postId }
						showDisplayNames={ true }
						context={ this.likeButtonRef.current }
					/>
				) }
				{ config.isEnabled( 'reader/login-window' ) && (
					<ReaderJoinConversationDialog
						onClose={ this.hideJoinConversationModal }
						isVisible={ showJoinConversationModal }
					/>
				) }
			</Fragment>
		);
	}
}

export default connect(
	( state, { siteId, postId } ) => {
		return {
			postByKey: getPostByKey( state, {
				blogId: siteId,
				postId,
			} ),
			likeCount: getPostLikeCount( state, siteId, postId ),
			iLike: isLikedPost( state, siteId, postId ),
			isLoggedIn: isUserLoggedIn( state ),
		};
	},
	{ markPostSeen }
)( ReaderLikeButton );
