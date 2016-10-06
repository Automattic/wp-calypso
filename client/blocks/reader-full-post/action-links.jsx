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
import PostEditButton from 'blocks/post-edit-button';
import { shouldShowComments } from 'blocks/comments/helper';
import { shouldShowLikes } from 'reader/like-helper';
import { shouldShowShare } from 'reader/share/helper';
import { userCan } from 'lib/posts/utils';
import * as stats from 'reader/stats';

const ReaderFullPostActionLinks = ( { post, site, onCommentClick } ) => {
	const onEditClick = () => {
		stats.recordAction( 'edit_post' );
		stats.recordGaEvent( 'Clicked Edit Post', 'full_post' );
		stats.recordTrackForPost( 'calypso_reader_edit_post_clicked', post );
	};

	return (
		<ul className="reader-full-post__action-links">
			{ site && userCan( 'edit_post', post ) &&
				<li className="reader-full-post__action-links-item">
					<PostEditButton post={ post } site={ site } onClick={ onEditClick } />
				</li>
			}
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
						onClick={ onCommentClick }
						tagName="div" />
				</li>
			}
			{ shouldShowLikes( post ) &&
				<li className="reader-full-post__action-links-item">
					<LikeButton
						key="like-button"
						siteId={ +post.site_ID }
						postId={ +post.ID }
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
	site: React.PropTypes.object,
	onCommentClick: React.PropTypes.func
};

export default ReaderFullPostActionLinks;
