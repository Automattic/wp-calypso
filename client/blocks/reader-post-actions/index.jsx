import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState } from 'react';
import CommentButton from 'calypso/blocks/comment-button';
import { shouldShowComments } from 'calypso/blocks/comments/helper';
import PostEditButton from 'calypso/blocks/post-edit-button';
import ShareButton from 'calypso/blocks/reader-share';
import { shouldShowShare, shouldShowReblog } from 'calypso/blocks/reader-share/helper';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
import ReaderCommentIcon from 'calypso/reader/components/icons/comment-icon';
import ReaderFollowButton from 'calypso/reader/follow-button';
import LikeButton from 'calypso/reader/like-button';
import { shouldShowLikes } from 'calypso/reader/like-helper';
import * as stats from 'calypso/reader/stats';
import { useSelector } from 'calypso/state';
import { userCan } from 'calypso/state/posts/utils';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';

import './style.scss';

const ReaderPostActions = ( props ) => {
	const {
		post,
		site,
		onCommentClick,
		showEdit,
		showSuggestedFollows,
		iconSize,
		className,
		fullPost,
		showFollow,
	} = props;

	const [ isSuggestedFollowsModalOpen, setIsSuggestedFollowsModalOpen ] = useState( false );

	const hasSites = !! useSelector( getPrimarySiteId );

	const openSuggestedFollowsModal = ( followClicked ) => {
		setIsSuggestedFollowsModalOpen( followClicked );
	};

	const onCloseSuggestedFollowModal = () => {
		setIsSuggestedFollowsModalOpen( false );
	};

	const onEditClick = () => {
		stats.recordAction( 'edit_post' );
		stats.recordGaEvent( 'Clicked Edit Post', 'full_post' );
		stats.recordTrackForPost( 'calypso_reader_edit_post_clicked', post );
	};

	const listClassnames = classnames( className, {
		'reader-post-actions': true,
	} );

	/* eslint-disable react/jsx-no-target-blank, wpcalypso/jsx-classname-namespace */
	return (
		<ul className={ listClassnames }>
			{ showEdit && site && userCan( 'edit_post', post ) && (
				<li className="reader-post-actions__item">
					<PostEditButton
						post={ post }
						site={ site }
						onClick={ onEditClick }
						iconSize={ iconSize }
					/>
				</li>
			) }
			{ showSuggestedFollows && post.site_ID && (
				<ReaderSuggestedFollowsDialog
					onClose={ onCloseSuggestedFollowModal }
					siteId={ +post.site_ID }
					postId={ +post.ID }
					isVisible={ isSuggestedFollowsModalOpen }
				/>
			) }
			{ showFollow && shouldShowLikes( post ) && (
				<li className="reader-post-actions__item">
					<ReaderFollowButton
						siteUrl={ post.feed_URL || post.site_URL }
						iconSize={ iconSize }
						onFollowToggle={ openSuggestedFollowsModal }
					/>
				</li>
			) }
			{ shouldShowShare( post ) && (
				<li className="reader-post-actions__item">
					<ShareButton post={ post } position="bottom" tagName="div" iconSize={ iconSize } />
				</li>
			) }
			{ shouldShowReblog( post, hasSites ) && (
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
			{ shouldShowComments( post ) && (
				<li className="reader-post-actions__item">
					<CommentButton
						key="comment-button"
						commentCount={ post.discussion.comment_count }
						post={ post }
						onClick={ onCommentClick }
						tagName="button"
						icon={ ReaderCommentIcon( { iconSize: iconSize } ) }
					/>
				</li>
			) }
			{ shouldShowLikes( post ) && (
				<li className="reader-post-actions__item">
					<LikeButton
						key="like-button"
						siteId={ +post.site_ID }
						postId={ +post.ID }
						post={ post }
						site={ site }
						fullPost={ fullPost }
						tagName="button"
						forceCounter={ true }
						iconSize={ iconSize }
						showZeroCount={ false }
						likeSource="reader"
					/>
				</li>
			) }
		</ul>
	);
	/* eslint-enable react/jsx-no-target-blank, wpcalypso/jsx-classname-namespace */
};

ReaderPostActions.propTypes = {
	post: PropTypes.object.isRequired,
	site: PropTypes.object,
	onCommentClick: PropTypes.func,
	showEdit: PropTypes.bool,
	showFollow: PropTypes.bool,
	showSuggestedFollows: PropTypes.bool,
	iconSize: PropTypes.number,
	visitUrl: PropTypes.string,
	fullPost: PropTypes.bool,
};

ReaderPostActions.defaultProps = {
	showEdit: true,
	showFollow: true,
	showVisit: false,
	showSuggestedFollows: false,
	iconSize: 20,
};

export default localize( ReaderPostActions );
