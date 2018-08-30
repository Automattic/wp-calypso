/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import CommentButton from 'blocks/comment-button';
import LikeButton from 'reader/like-button';
import ShareButton from 'blocks/reader-share';
import PostEditButton from 'blocks/post-edit-button';
import ReaderPostOptionsMenu from 'blocks/reader-post-options-menu';
import { shouldShowComments } from 'blocks/comments/helper';
import { shouldShowLikes } from 'reader/like-helper';
import { shouldShowShare } from 'blocks/reader-share/helper';
import { userCan } from 'state/posts/utils';
import * as stats from 'reader/stats';
import PostLikesCaterpillar from 'blocks/post-likes-caterpillar';
import countPostLikes from 'state/selectors/count-post-likes';
import { getPostTotalCommentsCount } from 'state/comments/selectors';

const ReaderPostActions = props => {
	const {
		post,
		site,
		onCommentClick,
		showEdit,
		showMenu,
		showMenuFollow,
		iconSize,
		className,
		fullPost,
		translate,
		likeCount,
		commentCount,
	} = props;

	const onEditClick = () => {
		stats.recordAction( 'edit_post' );
		stats.recordGaEvent( 'Clicked Edit Post', 'full_post' );
		stats.recordTrackForPost( 'calypso_reader_edit_post_clicked', post );
	};

	const listClassnames = classnames( 'reader-post-actions', className );
	const showLikes = shouldShowLikes( post );

	/* eslint-disable react/jsx-no-target-blank, wpcalypso/jsx-classname-namespace */
	return (
		<ul className={ listClassnames }>
			{ showLikes && (
				<li className="reader-post-actions__item reader-post-actions__visit">
					<PostLikesCaterpillar
						blogId={ +post.site_ID }
						postId={ +post.ID }
						gravatarSize={ 12 }
						className="reader-post-actions__post-likes-caterpillar"
					/>
					{ commentCount > 0 && (
						<div className="reader-post-actions__item-text">
							{ translate( '%(count)d comment', '%(count)d comments', {
								count: commentCount,
								args: {
									count: commentCount,
								},
							} ) }
						</div>
					) }
					{ likeCount > 0 && (
						<div className="reader-post-actions__item-text">
							{ translate( '%(count)d like', '%(count)d likes', {
								count: likeCount,
								args: {
									count: likeCount,
								},
							} ) }
						</div>
					) }
				</li>
			) }
			{ showEdit &&
				site &&
				userCan( 'edit_post', post ) && (
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
						tagName="div"
						size={ iconSize }
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
						tagName="div"
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

export default connect( ( state, ownProps ) => {
	const { post, post: { site_ID: siteId, ID: postId } = {} } = ownProps;

	if ( ! siteId || ! postId ) {
		return {};
	}

	const postCommentCount = get( post, [ 'discussion', 'comment_count' ] );

	const likeCount = countPostLikes( state, siteId, postId ) || 0;
	const commentCount = getPostTotalCommentsCount( state, siteId, postId ) || postCommentCount;
	return {
		likeCount,
		commentCount,
	};
} )( localize( ReaderPostActions ) );
