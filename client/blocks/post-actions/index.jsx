/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { get, partial } from 'lodash';
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
import { canCurrentUser } from 'state/selectors';
import { isJetpackModuleActive, isJetpackSite } from 'state/sites/selectors';

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

const recordEvent = partial( recordGoogleEvent, 'Posts' );

const PostActions = ( {
	className,
	post,
	showComments,
	showLikes,
	showStats,
	site,
	toggleComments,
	trackRelativeTimeStatusOnClick,
	trackTotalViewsOnClick
} ) => {
	const { contentLinkURL, contentLinkTarget } = getContentLink( site, post );
	const isDraft = post.status === 'draft';

	return (
		<ul className={ classnames( 'post-actions', className ) }>
			<li className="post-actions__item post-actions__relative-time">
				<PostRelativeTimeStatus
					post={ post }
					link={ contentLinkURL }
					target={ contentLinkTarget }
					onClick={ trackRelativeTimeStatusOnClick } />
			</li>
			{ ! isDraft && showComments &&
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
			{ ! isDraft && showLikes &&
				<li className="post-actions__item">
					<LikeButton
						key="like-button"
						siteId={ +post.site_ID }
						postId={ +post.ID }
						post={ post }
						site={ site } />
				</li>
			}
			{ ! isDraft && showStats &&
				<li className="post-actions__item post-actions__total-views">
					<PostTotalViews
						post={ post }
						clickHandler={ trackTotalViewsOnClick } />
				</li>
			}
		</ul>
	);
};

PostActions.propTypes = {
	className: React.PropTypes.string,
	post: React.PropTypes.object.isRequired,
	site: React.PropTypes.object.isRequired,
	toggleComments: React.PropTypes.func.isRequired,
	trackRelativeTimeStatusOnClick: React.PropTypes.func,
	trackTotalViewsOnClick: React.PropTypes.func,
};

const mapStateToProps = ( state, { site, post } ) => {
	const siteId = get( site, 'ID' );
	const isJetpack = isJetpackSite( state, siteId );

	// TODO: Maybe add dedicated selectors for the following.
	const showComments = ( ! isJetpack || isJetpackModuleActive( state, siteId, 'comments' ) ) &&
		post.discussion && post.discussion.comments_open;
	const showLikes = ! isJetpack || isJetpackModuleActive( state, siteId, 'likes' );
	const showStats = canCurrentUser( state, siteId, 'view_stats' ) &&
		( ! isJetpack || isJetpackModuleActive( state, siteId, 'stats' ) );

	return {
		showComments,
		showLikes,
		showStats
	};
};

const mapDispatchToProps = dispatch => bindActionCreators( {
	trackRelativeTimeStatusOnClick: () => recordEvent( 'Clicked Post Date' ),
	trackTotalViewsOnClick: () => recordEvent( 'Clicked View Post Stats' )
}, dispatch );

export default connect( mapStateToProps, mapDispatchToProps )( localize( PostActions ) );
