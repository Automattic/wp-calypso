/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { noop, partial } from 'lodash';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { recordGoogleEvent } from 'state/analytics/actions';
import PostRelativeTimeStatus from 'my-sites/post-relative-time-status';
import CommentButton from 'blocks/comment-button';
import LikeButton from 'my-sites/post-like-button';
import PostTotalViews from 'my-sites/posts/post-total-views';
import { canCurrentUser } from 'state/selectors';
import { isJetpackModuleActive, isJetpackSite, getSiteSlug } from 'state/sites/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';

const getContentLink = ( state, siteId, post ) => {
	let contentLinkURL = post.URL;
	let contentLinkTarget = '_blank';

	if ( canCurrentUser( state, siteId, 'edit_post' ) && post.status !== 'trash' ) {
		contentLinkURL = getEditorPath( state, siteId, post.ID );
		contentLinkTarget = null;
	} else if ( post.status === 'trash' ) {
		contentLinkURL = null;
	}

	return { contentLinkURL, contentLinkTarget };
};

const recordEvent = partial( recordGoogleEvent, 'Posts' );

const PostActions = ( {
	className,
	compact,
	contentLink,
	post,
	showComments,
	showLikes,
	showStats,
	siteSlug,
	statsIcon,
	toggleComments,
	trackRelativeTimeStatusOnClick,
	trackTotalViewsOnClick,
} ) => {
	const { contentLinkURL, contentLinkTarget } = contentLink;
	const isDraft = post.status === 'draft';
	const size = compact ? 18 : 24;

	return (
		<ul className={ classnames( 'post-actions', className ) }>
			{ ! compact && (
				<li className="post-actions__item post-actions__relative-time">
					<PostRelativeTimeStatus
						post={ post }
						link={ contentLinkURL }
						target={ contentLinkTarget }
						onClick={ trackRelativeTimeStatusOnClick }
					/>
				</li>
			) }
			{ ! isDraft &&
				showComments && (
					<li className="post-actions__item">
						{ config.isEnabled( 'comments/management/post-view' ) ? (
							<CommentButton
								key="comment-button"
								post={ post }
								showLabel={ false }
								commentCount={ post.discussion.comment_count }
								tagName="a"
								href={ `/comments/all/${ siteSlug }/${ post.ID }` }
								size={ size }
							/>
						) : (
							<CommentButton
								key="comment-button"
								post={ post }
								showLabel={ false }
								commentCount={ post.discussion.comment_count }
								onClick={ toggleComments || noop }
								tagName="div"
								size={ size }
							/>
						) }
					</li>
				) }
			{ ! isDraft &&
				showLikes && (
					<li className="post-actions__item">
						<LikeButton
							key="like-button"
							iconSize={ size }
							siteId={ +post.site_ID }
							postId={ +post.ID }
							post={ post }
						/>
					</li>
				) }
			{ ! isDraft &&
				showStats && (
					<li className="post-actions__item post-actions__total-views">
						<PostTotalViews
							icon={ statsIcon }
							post={ post }
							size={ size }
							clickHandler={ trackTotalViewsOnClick }
						/>
					</li>
				) }
		</ul>
	);
};

PostActions.propTypes = {
	className: PropTypes.string,
	compact: PropTypes.bool,
	post: PropTypes.object.isRequired,
	siteId: PropTypes.number.isRequired,
	statsIcon: PropTypes.string,
	toggleComments: PropTypes.func,
	trackRelativeTimeStatusOnClick: PropTypes.func,
	trackTotalViewsOnClick: PropTypes.func,
};

PostActions.defaultProps = {
	statsIcon: 'visible',
};

const mapStateToProps = ( state, { siteId, post } ) => {
	const isJetpack = isJetpackSite( state, siteId );
	const siteSlug = getSiteSlug( state, siteId );

	// TODO: Maybe add dedicated selectors for the following.
	const showComments =
		( ! isJetpack || isJetpackModuleActive( state, siteId, 'comments' ) ) &&
		post.discussion &&
		post.discussion.comments_open;
	const showLikes = ! isJetpack || isJetpackModuleActive( state, siteId, 'likes' );
	const showStats =
		canCurrentUser( state, siteId, 'view_stats' ) &&
		( ! isJetpack || isJetpackModuleActive( state, siteId, 'stats' ) );

	return {
		contentLink: getContentLink( state, siteId, post ),
		showComments,
		showLikes,
		showStats,
		siteSlug,
	};
};

const mapDispatchToProps = dispatch =>
	bindActionCreators(
		{
			trackRelativeTimeStatusOnClick: () => recordEvent( 'Clicked Post Date' ),
			trackTotalViewsOnClick: () => recordEvent( 'Clicked View Post Stats' ),
		},
		dispatch
	);

export default connect( mapStateToProps, mapDispatchToProps )( localize( PostActions ) );
