/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import CommentButton from 'calypso/blocks/comment-button';
import LikeButton from 'calypso/reader/like-button';
import ShareButton from 'calypso/blocks/reader-share';
import PostEditButton from 'calypso/blocks/post-edit-button';
import ReaderPostOptionsMenu from 'calypso/blocks/reader-post-options-menu';
import { shouldShowComments } from 'calypso/blocks/comments/helper';
import { shouldShowLikes } from 'calypso/reader/like-helper';
import { shouldShowShare } from 'calypso/blocks/reader-share/helper';
import { userCan } from 'calypso/state/posts/utils';
import * as stats from 'calypso/reader/stats';
import { localize } from 'i18n-calypso';
import ReaderVisitLink from 'calypso/blocks/reader-visit-link';

/**
 * Style dependencies
 */
import './style.scss';

const ReaderPostActions = ( props ) => {
	const {
		post,
		site,
		onCommentClick,
		showEdit,
		showVisit,
		showMenu,
		showMenuFollow,
		iconSize,
		className,
		visitUrl,
		fullPost,
		translate,
	} = props;

	const onEditClick = () => {
		stats.recordAction( 'edit_post' );
		stats.recordGaEvent( 'Clicked Edit Post', 'full_post' );
		stats.recordTrackForPost( 'calypso_reader_edit_post_clicked', post );
	};

	function onPermalinkVisit() {
		stats.recordPermalinkClick( 'card', post );
	}

	const listClassnames = classnames( 'reader-post-actions', className );

	/* eslint-disable react/jsx-no-target-blank, wpcalypso/jsx-classname-namespace */
	return (
		<ul className={ listClassnames }>
			{ showVisit && (
				<li className="reader-post-actions__item reader-post-actions__visit">
					<ReaderVisitLink
						href={ visitUrl || post.URL }
						iconSize={ iconSize }
						onClick={ onPermalinkVisit }
					>
						{ translate( 'Visit' ) }
					</ReaderVisitLink>
				</li>
			) }
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
			{ shouldShowShare( post ) && (
				<li className="reader-post-actions__item">
					<ShareButton post={ post } position="bottom" tagName="div" iconSize={ iconSize } />
				</li>
			) }
			{ shouldShowComments( post ) && (
				<li className="reader-post-actions__item">
					<CommentButton
						key="comment-button"
						commentCount={ post.discussion.comment_count }
						onClick={ onCommentClick }
						tagName="button"
						size={ iconSize }
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
						likeSource={ 'reader' }
					/>
				</li>
			) }
			{ showMenu && (
				<li className="reader-post-actions__item">
					<ReaderPostOptionsMenu
						className="ignore-click"
						showFollow={ showMenuFollow }
						post={ post }
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
	iconSize: PropTypes.number,
	showMenu: PropTypes.bool,
	showMenuFollow: PropTypes.bool,
	visitUrl: PropTypes.string,
	fullPost: PropTypes.bool,
};

ReaderPostActions.defaultProps = {
	showEdit: true,
	showVisit: false,
	showMenu: false,
	iconSize: 24,
	showMenuFollow: true,
};

export default localize( ReaderPostActions );
