import PropTypes from 'prop-types';
import CommentButton from 'calypso/blocks/comment-button';
import PostEditButton from 'calypso/blocks/post-edit-button';
import ReaderCommentIcon from 'calypso/reader/components/icons/comment-icon';
import LikeButton from 'calypso/reader/like-button';
import { shouldShowLikes } from 'calypso/reader/like-helper';
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
} ) => {
	const canEdit = site && userCan( 'edit_post', post );
	const showLikes = shouldShowLikes( post );

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
					/>
				) }

				{ showLikes && (
					<LikeButton
						siteId={ +post.site_ID }
						postId={ +post.ID }
						fullPost
						tagName="div"
						likeSource="reader"
						iconSize={ 24 }
					/>
				) }

				{ renderMarkAsSeenButton && renderMarkAsSeenButton() }
			</div>

			<div className="reader-full-post__action-bar-right">
				{ canEdit && (
					<PostEditButton post={ post } site={ site } iconSize={ 24 } onClick={ onEditClick } />
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
};

export default ReaderFullPostActionBar;
