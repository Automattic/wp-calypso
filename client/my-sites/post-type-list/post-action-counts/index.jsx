/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import PostLikesPopover from 'blocks/post-likes/popover';
import { getNormalizedPost } from 'state/posts/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import { getSiteSlug, isJetpackModuleActive, isJetpackSite } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { hideActiveLikesPopover, toggleLikesPopover } from 'state/ui/post-type-list/actions';
import { isLikesPopoverOpen } from 'state/ui/post-type-list/selectors';
import { getRecentViewsForPost } from 'state/stats/recent-post-views/selectors';
import { ScreenReaderText } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

class PostActionCounts extends PureComponent {
	static propTypes = {
		globalId: PropTypes.string,
	};

	onActionClick = ( action ) => () => {
		const { recordTracksEvent: record, type } = this.props;

		record( 'calypso_post_list_action_click', {
			action,
			post_type: type,
			context: 'action_counts',
		} );
	};

	onLikesClick = ( event ) => {
		this.onActionClick( 'likes' )();
		event.preventDefault();

		this.props.toggleLikesPopover( this.props.globalId );
	};

	closeLikesPopover = () => {
		this.props.hideActiveLikesPopover();
	};

	setLikesPopoverContext = ( element ) => {
		this.setState( { likesPopoverContext: element } );
	};

	renderCommentCount() {
		const {
			commentCount: count,
			numberFormat,
			postId,
			showComments,
			siteSlug,
			translate,
		} = this.props;

		if ( count < 1 || ! showComments ) {
			return null;
		}

		return (
			<li>
				<a
					href={ `/comments/all/${ siteSlug }/${ postId }` }
					onClick={ this.onActionClick( 'comments' ) }
				>
					{
						// translators: count is the number of comments, eg 5 Comments
						translate( '%(count)s Comment', '%(count)s Comments', {
							count,
							args: { count: numberFormat( count ) },
						} )
					}
				</a>
			</li>
		);
	}

	renderViewCount() {
		const { viewCount: count, numberFormat, postId, showViews, siteSlug, translate } = this.props;
		if ( ! count || count < 1 || ! showViews ) {
			return null;
		}
		const recentViewsText = translate(
			'%(count)s Recent View{{srText}}in the past 30 days{{/srText}}',
			'%(count)s Recent Views{{srText}}in the past 30 days{{/srText}}',
			{
				count,
				args: {
					count: numberFormat( count ),
				},
				comment:
					'text wrapped by "srText" is not visible on screen for brevity, but is read by screen readers to provide more context',
				components: {
					srText: <ScreenReaderText />,
				},
			}
		);
		const linkTitleText = translate(
			'%(count)s recent view in the past 30 days',
			'%(count)s recent views in the past 30 days',
			{
				count,
				args: {
					count: numberFormat( count ),
				},
			}
		);

		return (
			<li>
				<a
					href={ `/stats/post/${ postId }/${ siteSlug }` }
					onClick={ this.onActionClick( 'stats' ) }
					title={ linkTitleText }
				>
					{ recentViewsText }
				</a>
			</li>
		);
	}

	renderLikeCount() {
		const {
			likeCount: count,
			numberFormat,
			siteId,
			postId,
			showLikes,
			siteSlug,
			translate,
			isCurrentLikesPopoverOpen,
		} = this.props;

		if ( count < 1 || ! showLikes ) {
			return null;
		}

		return (
			<li ref={ this.setLikesPopoverContext }>
				<a href={ `/stats/post/${ postId }/${ siteSlug }` } onClick={ this.onLikesClick }>
					{
						// translators: count is the number of likes
						translate( '%(count)s Like', '%(count)s Likes', {
							count,
							args: { count: numberFormat( count ) },
						} )
					}
				</a>
				{ isCurrentLikesPopoverOpen && (
					<PostLikesPopover
						siteId={ siteId }
						postId={ postId }
						showDisplayNames={ true }
						context={ this.state.likesPopoverContext }
						position="bottom"
						onClose={ this.closeLikesPopover }
					/>
				) }
			</li>
		);
	}

	render() {
		return (
			<ul className="post-action-counts">
				{ this.renderViewCount() }
				{ this.renderLikeCount() }
				{ this.renderCommentCount() }
			</ul>
		);
	}
}

export default connect(
	( state, { globalId } ) => {
		const post = getNormalizedPost( state, globalId );
		const postId = post && post.ID;
		const siteId = post && post.site_ID;

		const isJetpack = isJetpackSite( state, siteId );

		const showComments =
			( ! isJetpack || isJetpackModuleActive( state, siteId, 'comments' ) ) &&
			post &&
			post.discussion &&
			post.discussion.comments_open;
		const showLikes = ! isJetpack || isJetpackModuleActive( state, siteId, 'likes' );
		const showViews =
			canCurrentUser( state, siteId, 'view_stats' ) &&
			( ! isJetpack || isJetpackModuleActive( state, siteId, 'stats' ) );

		return {
			commentCount: get( post, 'discussion.comment_count', null ),
			likeCount: get( post, 'like_count', null ),
			postId,
			showComments,
			showLikes,
			showViews,
			siteId,
			siteSlug: getSiteSlug( state, siteId ),
			type: get( post, 'type', 'unknown' ),
			viewCount: getRecentViewsForPost( state, siteId, postId ),
			isCurrentLikesPopoverOpen: isLikesPopoverOpen( state, globalId ),
		};
	},
	{
		hideActiveLikesPopover,
		toggleLikesPopover,
		recordTracksEvent,
	}
)( localize( PostActionCounts ) );
