/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CommentButton from 'blocks/comment-button';
import LikeButton from 'reader/like-button';
import ShareButton from 'reader/share';
import { shouldShowComments } from 'blocks/comments/helper';
import { shouldShowLikes } from 'reader/like-helper';
import { shouldShowShare } from 'reader/share/helper';

const ReaderFullPostActionLinks = ( { post, handleCommentButtonClick } ) => {
	return (
		<ul className="reader-full-post__action-links">
			{ shouldShowShare( post ) &&
				<li className="reader-full-post__action-links-item">
					<ShareButton post={ post } position="bottom" tagName="div" />
				</li>
			}
			{ shouldShowComments( post ) &&
				<li className="reader-full-post__action-links-item">
					<CommentButton
						key="comment-button"
						commentCount={ post.discussion.comment_count }
						onClick={ handleCommentButtonClick }
						tagName="div" />
				</li>
			}
			{ shouldShowLikes( post ) &&
				<li className="reader-full-post__action-links-item">
					<LikeButton
						key="like-button"
						siteId={ post.site_ID }
						postId={ post.ID }
						fullPost={ true }
						tagName="div"
						forceCounter={ true } />
				</li>
			}
		</ul>
	);
};

ReaderFullPostActionLinks.propTypes = {
	post: React.PropTypes.object.isRequired,
	handleCommentButtonClick: React.PropTypes.func
};

export default ReaderFullPostActionLinks;
