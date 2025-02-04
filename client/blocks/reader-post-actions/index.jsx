import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import CommentButton from 'calypso/blocks/comment-button';
import { shouldShowComments } from 'calypso/blocks/comments/helper';
import ShareButton from 'calypso/blocks/reader-share';
import { shouldShowShare, shouldShowReblog } from 'calypso/blocks/reader-share/helper';
import ReaderCommentIcon from 'calypso/reader/components/icons/comment-icon';
import LikeButton from 'calypso/reader/like-button';
import { shouldShowLikes } from 'calypso/reader/like-helper';
import { useSelector } from 'calypso/state';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';

import './style.scss';

const ReaderPostActions = ( {
	post,
	site,
	onCommentClick,
	iconSize = 20,
	className,
	fullPost,
} ) => {
	const translate = useTranslate();
	const hasSites = !! useSelector( getPrimarySiteId );

	const showShare = shouldShowShare( post );
	const showReblog = shouldShowReblog( post, hasSites );
	const showComments = shouldShowComments( post );
	const showLikes = shouldShowLikes( post );

	const listClassnames = clsx( 'reader-post-actions', className );

	return (
		<ul className={ listClassnames }>
			{ showShare && (
				<li className="reader-post-actions__item">
					<ShareButton
						post={ post }
						position="bottom"
						tagName="div"
						iconSize={ iconSize }
						showLabel
					/>
				</li>
			) }
			{ showReblog && (
				<li className="reader-post-actions__item">
					<ShareButton
						post={ post }
						position="bottom"
						tagName="div"
						iconSize={ iconSize }
						isReblogSelection
						showLabel
					/>
				</li>
			) }
			{ showComments && (
				<li className="reader-post-actions__item">
					<CommentButton
						key="comment-button"
						commentCount={ post.discussion.comment_count }
						post={ post }
						onClick={ onCommentClick }
						tagName="button"
						icon={ ReaderCommentIcon( {
							iconSize,
							viewBox: '0 -1 20 20',
						} ) }
						defaultLabel={ translate( 'Comment' ) }
					/>
				</li>
			) }
			{ showLikes && (
				<li className="reader-post-actions__item">
					<LikeButton
						key="like-button"
						siteId={ +post.site_ID }
						postId={ +post.ID }
						post={ post }
						site={ site }
						fullPost={ fullPost }
						tagName="button"
						forceCounter
						iconSize={ iconSize }
						showZeroCount={ false }
						likeSource="reader"
						defaultLabel={ translate( 'Like' ) }
					/>
				</li>
			) }
		</ul>
	);
};

ReaderPostActions.propTypes = {
	post: PropTypes.object.isRequired,
	site: PropTypes.object,
	onCommentClick: PropTypes.func,
	iconSize: PropTypes.number,
	fullPost: PropTypes.bool,
};

export default ReaderPostActions;
