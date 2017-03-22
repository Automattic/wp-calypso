/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { partial } from 'lodash';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordGoogleEvent } from 'state/analytics/actions';
import PostRelativeTimeStatus from 'my-sites/post-relative-time-status';
import CommentButton from 'blocks/comment-button';
import LikeButton from 'my-sites/post-like-button';
import PostTotalViews from 'my-sites/posts/post-total-views';
import utils from 'lib/posts/utils';

const getContentLink = ( site, post ) => {
	let contentLinkURL = post.URL;
	let contentLinkTarget = '_blank';

	if ( utils.userCan( 'edit_post', post ) ) {
		contentLinkURL = utils.getEditURL( post, site );
		contentLinkTarget = null;
	} else if ( post.status === 'trash' ) {
		contentLinkURL = null;
	}

	return { contentLinkURL, contentLinkTarget };
};

const showComments = ( site, post ) =>
	( ! site.jetpack || site.isModuleActive( 'comments' ) ) &&
	post.discussion &&
	post.discussion.comments_open;
const showLikes = site => ! site.jetpack || site.isModuleActive( 'likes' );
const showStats = site => site.capabilities	&&
	site.capabilities.view_stats &&
	( ! site.jetpack || site.isModuleActive( 'stats' ) );

const PostActions = ( { className, post, site, toggleComments, recordEvent } ) => {
	const { contentLinkURL, contentLinkTarget } = getContentLink( site, post );
	const isDraft = post.status === 'draft';

	const postRelativeTimeStatusOnClick = () => recordEvent( 'Clicked Post Date' );
	const postTotalViewsOnClick = () => recordEvent( 'Clicked View Post Stats' );

	return (
		<ul className={ classnames( 'post-actions', className ) }>
			<li className="post-actions__item post-actions__relative-time">
				<PostRelativeTimeStatus
					post={ post }
					link={ contentLinkURL }
					target={ contentLinkTarget }
					onClick={ postRelativeTimeStatusOnClick } />
			</li>
			{ ! isDraft && showComments( site, post ) &&
				<li className="post-actions__item">
					<CommentButton
						key="comment-button"
						post={ post }
						showLabel={ false }
						commentCount={ post.discussion.comment_count }
						onClick={ toggleComments }
						tagName="div" />
				</li>
			}
			{ ! isDraft && showLikes( site ) &&
				<li className="post-actions__item">
					<LikeButton
						key="like-button"
						siteId={ +post.site_ID }
						postId={ +post.ID }
						post={ post }
						site={ site }
						tagName="a"
						animateLike={ false }
						forceCounter={ true }
						showLabel={ false }
						showZeroCount={ false } />
				</li>
			}
			{ ! isDraft && showStats( site ) &&
				<li className="post-actions__item post-actions__total-views">
					<PostTotalViews
						post={ post }
						clickHandler={ postTotalViewsOnClick } />
				</li>
			}
		</ul>
	);
};

PostActions.propTypes = {
	post: React.PropTypes.object.isRequired,
};

export default connect(
	null,
	{ recordEvent: partial( recordGoogleEvent, 'Posts' ) }
)( localize( PostActions ) );
