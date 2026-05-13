import { readTeamsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { Icon, globe } from '@wordpress/icons';
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
import { recordAction, recordPermalinkClick } from 'calypso/reader/stats';
import { useSelector } from 'calypso/state';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { ReaderFreshlyPressedButton } from '../reader-freshly-pressed-button';
import './style.scss';

const ReaderPostActions = ( {
	post,
	site,
	onCommentClick,
	iconSize = 24,
	className,
	fullPost,
	commentsApiDisabled = false,
	likeContext,
	markLikedPostSeen,
	showFreshlyPressed = true,
	showViewOriginal = false,
	visitUrl,
} ) => {
	const translate = useTranslate();
	const hasSites = !! useSelector( getPrimarySiteId );
	const showShare = isSharable( post );
	const showReblog = isRebloggable( post, hasSites );
	const showComments = isCommentsOpen( post ) || post.discussion?.comment_count > 0;
	const showLikes = isLikeable( post );
	const viewOriginalUrl = visitUrl || post.URL;
	const shouldShowViewOriginal = showViewOriginal && viewOriginalUrl;
	const listClassnames = clsx( 'reader-post-actions', className );
	const shouldQueryTeams = showFreshlyPressed && fullPost && showShare;
	const { data } = useQuery( { ...readTeamsQuery(), enabled: shouldQueryTeams } );
	const isAutomattician = isAutomatticTeamMember( data?.teams ?? [] );
	const shouldShowFreshlyPressed = shouldQueryTeams && isAutomattician;

	const handleViewOriginalClick = () => {
		recordAction( 'clicked_view_original' );
		recordPermalinkClick( 'full_post_visit_link', post );
	};

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
						post={ post }
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
						likeContext={ likeContext }
						markLikedPostSeen={ markLikedPostSeen }
						tagName="button"
						forceCounter
						iconSize={ iconSize }
						showZeroCount={ false }
						likeSource="reader"
					/>
				</li>
			) }
			{ shouldShowViewOriginal && (
				<li className="reader-post-actions__item">
					<a
						className="reader-post-actions__view-original"
						href={ viewOriginalUrl }
						target="_blank"
						rel="external noopener noreferrer"
						onClick={ handleViewOriginalClick }
					>
						<Icon icon={ globe } size={ iconSize } />
						<span className="reader-post-actions__view-original-label">
							{ translate( 'View original' ) }
						</span>
					</a>
				</li>
			) }
			{ shouldShowFreshlyPressed && (
				<li className="reader-post-actions__item">
					<ReaderFreshlyPressedButton blogId={ post.site_ID } postId={ post.ID } />
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
	likeContext: PropTypes.string,
	markLikedPostSeen: PropTypes.bool,
	showFreshlyPressed: PropTypes.bool,
	showViewOriginal: PropTypes.bool,
	visitUrl: PropTypes.string,
};

export default ReaderPostActions;
