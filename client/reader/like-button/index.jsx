import { createRef, Component, Fragment } from 'react';
import { connect } from 'react-redux';
import LikeButtonContainer from 'calypso/blocks/like-button';
import PostLikesPopover from 'calypso/blocks/post-likes/popover';
import QueryPostLikes from 'calypso/components/data/query-post-likes';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { getPostLikeCount } from 'calypso/state/posts/selectors/get-post-like-count';
import { isLikedPost } from 'calypso/state/posts/selectors/is-liked-post';
import { markPostSeen } from 'calypso/state/reader/posts/actions';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import './style.scss';

class ReaderLikeButton extends Component {
	state = {
		showLikesPopover: false,
	};

	hidePopoverTimeout = null;
	likeButtonRef = createRef();

	componentWillUnmount() {
		clearTimeout( this.hidePopoverTimeout );
	}

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
		const { siteId, postId, likeCount, iLike } = this.props;
		const { showLikesPopover } = this.state;
		const hasEnoughLikes = ( likeCount > 0 && ! iLike ) || ( likeCount > 1 && iLike );

		return (
			<Fragment>
				<QueryPostLikes siteId={ siteId } postId={ postId } />
				<LikeButtonContainer
					{ ...this.props }
					ref={ this.likeButtonRef }
					onMouseEnter={ this.showLikesPopover }
					onMouseLeave={ this.hideLikesPopover }
					onLikeToggle={ this.recordLikeToggle }
					likeSource="reader"
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
		};
	},
	{ markPostSeen }
)( ReaderLikeButton );
