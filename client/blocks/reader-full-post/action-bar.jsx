import { Icon, globe } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import CommentButton from 'calypso/blocks/comment-button';
import PostEditButton from 'calypso/blocks/post-edit-button';
import ReaderCommentIcon from 'calypso/reader/components/icons/comment-icon';
import ReaderFollowButton from 'calypso/reader/follow-button';
import LikeButton from 'calypso/reader/like-button';
import { isLikeable } from 'calypso/reader/post/capabilities';
import { recordAction, recordPermalinkClick } from 'calypso/reader/stats';
import { userCan } from 'calypso/state/posts/utils';

const ReaderFullPostActionBar = ( {
	post,
	site,
	commentCount,
	onCommentClick,
	onEditClick,
	commentsApiDisabled,
	showComments,
	renderMarkAsSeenButton,
	feedUrl,
	siteUrl,
	onFollowToggle,
} ) => {
	const translate = useTranslate();
	const canEdit = site && userCan( 'edit_post', post );
	const showLikes = isLikeable( post );
	const followUrl = feedUrl || siteUrl;
	const feedId = post.feed_ID ? Number( post.feed_ID ) : undefined;
	const siteId = post.site_ID ? Number( post.site_ID ) : undefined;
	const viewOriginalUrl = post.URL;

	const handleViewOriginalClick = () => {
		recordAction( 'clicked_view_original' );
		recordPermalinkClick( 'full_post_visit_link', post );
	};

	return (
		<div className="reader-full-post__action-bar">
			<div className="reader-full-post__action-bar-left">
				{ showComments && ! commentsApiDisabled && (
					<CommentButton
						key="comment-button"
						commentCount={ commentCount }
						onClick={ onCommentClick }
						tagName="div"
						icon={ ReaderCommentIcon( { iconSize: 24 } ) }
						alwaysShowTooltip
					/>
				) }

				{ showLikes && (
					<LikeButton
						siteId={ siteId }
						postId={ +post.ID }
						fullPost
						tagName="div"
						likeSource="reader"
						iconSize={ 24 }
					/>
				) }

				{ viewOriginalUrl && (
					<a
						className="reader-full-post__view-original-button"
						href={ viewOriginalUrl }
						target="_blank"
						rel="external noopener noreferrer"
						onClick={ handleViewOriginalClick }
					>
						<Icon
							icon={ globe }
							size={ 24 }
							className="reader-full-post__view-original-button-icon"
						/>
						<span className="reader-full-post__view-original-button-label">
							{ translate( 'View original' ) }
						</span>
					</a>
				) }

				{ renderMarkAsSeenButton && renderMarkAsSeenButton() }
			</div>

			<div className="reader-full-post__action-bar-right">
				{ canEdit && (
					<PostEditButton post={ post } site={ site } iconSize={ 24 } onClick={ onEditClick } />
				) }
				{ followUrl && (
					<ReaderFollowButton
						feedId={ feedId }
						siteId={ siteId }
						siteUrl={ followUrl }
						onFollowToggle={ onFollowToggle }
						railcar={ post?.railcar }
					/>
				) }
			</div>
		</div>
	);
};

ReaderFullPostActionBar.propTypes = {
	post: PropTypes.object.isRequired,
	site: PropTypes.object,
	commentCount: PropTypes.number,
	onCommentClick: PropTypes.func,
	onEditClick: PropTypes.func,
	commentsApiDisabled: PropTypes.bool,
	showComments: PropTypes.bool,
	renderMarkAsSeenButton: PropTypes.func,
	feedUrl: PropTypes.string,
	siteUrl: PropTypes.string,
	onFollowToggle: PropTypes.func,
};

export default ReaderFullPostActionBar;
