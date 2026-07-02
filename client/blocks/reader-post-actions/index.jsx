import { readTeamsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { category } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import CommentButton from 'calypso/blocks/comment-button';
import ReaderSaveButton from 'calypso/blocks/reader-save-button';
import ShareButton from 'calypso/blocks/reader-share';
import ReaderCommentIcon from 'calypso/reader/components/icons/comment-icon';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import LikeButton from 'calypso/reader/like-button';
import {
	isCommentsOpen,
	isSharable,
	isRebloggable,
	isLikeable,
} from 'calypso/reader/post/capabilities';
import { useSpacePicker } from 'calypso/reader/spaces/subscribe-with-space/use-space-picker';
import { useSelector } from 'calypso/state';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { ReaderFreshlyPressedButton } from '../reader-freshly-pressed-button';
import './style.scss';

/**
 * @param {{ post: Object; site?: Object; onCommentClick?: Function; iconSize?: number; className?: string; fullPost?: boolean; commentsApiDisabled?: boolean; variant?: 'default' | 'discreet'; split?: boolean; }} props
 */
const ReaderPostActions = ( {
	post,
	site,
	onCommentClick,
	iconSize = 24,
	className,
	fullPost,
	commentsApiDisabled = false,
	variant = 'default',
	split = false,
} ) => {
	const translate = useTranslate();
	const showSpaces = isEnabled( 'reader/spaces' );
	const { openSpacePicker, spacePickerModal } = useSpacePicker( {
		feedId: post.feed_ID,
		blogId: post.site_ID,
		feedUrl: post.feed_URL || post.site_URL,
		source: 'post_actions',
	} );
	const hasSites = !! useSelector( getPrimarySiteId );
	const showShare = isSharable( post );
	const showReblog = isRebloggable( post, hasSites );
	const showComments = isCommentsOpen( post ) || post.discussion?.comment_count > 0;
	const showLikes = isLikeable( post );
	const listClassnames = clsx( 'reader-post-actions', className, {
		'is-discreet': variant === 'discreet',
		'is-split': split,
	} );
	const { data } = useQuery( readTeamsQuery() );
	const isAutomattician = isAutomatticTeamMember( data?.teams ?? [] );
	const shouldShowFreshlyPressed = fullPost && isAutomattician && showShare;

	return (
		<>
			<ul className={ listClassnames }>
				{ showSpaces && (
					<li className="reader-post-actions__item">
						<Button
							className="reader-post-actions__space-button"
							icon={ category }
							iconSize={ iconSize }
							label={ translate( 'Move site to a space' ) }
							onClick={ openSpacePicker }
						/>
					</li>
				) }
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
				{ isEnabled( 'reader/saved-posts' ) && (
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
				{ shouldShowFreshlyPressed && (
					<li className="reader-post-actions__item">
						<ReaderFreshlyPressedButton blogId={ post.site_ID } postId={ post.ID } />
					</li>
				) }
			</ul>
			{ showSpaces && spacePickerModal }
		</>
	);
};

ReaderPostActions.propTypes = {
	post: PropTypes.object.isRequired,
	site: PropTypes.object,
	onCommentClick: PropTypes.func,
	iconSize: PropTypes.number,
	fullPost: PropTypes.bool,
	commentsApiDisabled: PropTypes.bool,
	variant: PropTypes.oneOf( [ 'default', 'discreet' ] ),
	split: PropTypes.bool,
};

export default ReaderPostActions;
