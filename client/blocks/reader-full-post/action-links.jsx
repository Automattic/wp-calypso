/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import LikeButton from 'reader/like-button';
//import { shouldShowComments } from 'blocks/comments/helper';
import { shouldShowLikes } from 'reader/like-helper';
//import { shouldShowShare } from 'reader/share/helper';

const ReaderFullPostActionLinks = ( { post } ) => {
	// if ( shouldShowComments ) {
	// 	buttons.push( <CommentButton key="comment-button" commentCount={ this.props.commentCount } onClick={ this.handleCommentButtonClick } tagName="div" /> );
	// }

	// if ( shouldShowShare ) {
	// 	buttons.push( <ShareButton post={ post } position="bottom" tagName="div" /> );
	// }

	return (
		<ul className="reader-full-post__action-links">
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
	post: React.PropTypes.object.isRequired
};

export default ReaderFullPostActionLinks;
