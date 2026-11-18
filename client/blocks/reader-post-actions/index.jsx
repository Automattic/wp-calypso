import { isEnabled } from '@automattic/calypso-config';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import CommentButton from 'calypso/blocks/comment-button';
import ReaderSaveButton from 'calypso/blocks/reader-save-button';
import ShareButton from 'calypso/blocks/reader-share';
import ReaderCommentIcon from 'calypso/reader/components/icons/comment-icon';
import { canSavePost } from 'calypso/reader/data/saved-posts';
import LikeButton from 'calypso/reader/like-button';
import {
	isCommentsOpen,
	isSharable,
	isRebloggable,
	isLikeable,
} from 'calypso/reader/post/capabilities';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import './style.scss';

/**
 * @param {{ post: Object; site?: Object; onCommentClick?: Function; iconSize?: number; className?: string; fullPost?: boolean; commentsApiDisabled?: boolean; }} props
 */
const ReaderPostActions = ( {
	post,
	site,
	onCommentClick,
	iconSize = 24,
	className,
	fullPost,
	commentsApiDisabled = false,
} ) => {
	const hasSites = !! useSelector( getPrimarySiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const showShare = isSharable( post );
	const showReblog = isRebloggable( post, hasSites );
	const showComments = isCommentsOpen( post ) || post.discussion?.comment_count > 0;
	const showLikes = isLikeable( post );
	const showSave = isEnabled( 'reader/saved-posts' ) && isLoggedIn && canSavePost( post );
	const listClassnames = clsx( 'reader-post-actions', className );

	return (
		<ul className={ listClassnames }>
			{ showShare && (
				<li className="reader-post-actions__item">
					<ShareButton post={ post } position="bottom" tagName="div" iconSize={ iconSize } />
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
					/>
				</li>
			) }
			{ showSave && (
				<li className="reader-post-actions__item">
					<ReaderSaveButton post={ post } iconSize={ iconSize } />
				</li>
			) }
			{ showComments && ! commentsApiDisabled && (
				<li className="reader-post-actions__item">
					<CommentButton
						key="comment-button"
						commentCount={ post.discussion.comment_count }
						onClick={ onCommentClick }
						tagName="button"
						icon={ ReaderCommentIcon( {
							iconSize,
							viewBox: '0 -1 20 20',
						} ) }
						alwaysShowTooltip
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
	commentsApiDisabled: PropTypes.bool,
};

export default ReaderPostActions;
