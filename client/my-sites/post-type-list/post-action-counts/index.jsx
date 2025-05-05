import { ScreenReaderText } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, PureComponent } from 'react';
import { connect } from 'react-redux';
import PostLikesPopover from 'calypso/blocks/post-likes/popover';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getNormalizedPost } from 'calypso/state/posts/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSiteSlug, isJetpackModuleActive, isJetpackSite } from 'calypso/state/sites/selectors';
import { getRecentViewsForPost } from 'calypso/state/stats/recent-post-views/selectors';
import './style.scss';

class PostActionCounts extends PureComponent {
	static propTypes = {
		globalId: PropTypes.string,
	};

	state = {
		showLikesPopover: false,
	};

	liRef = createRef();

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

		this.setState( ( { showLikesPopover } ) => ( {
			showLikesPopover: ! showLikesPopover,
		} ) );
	};

	closeLikesPopover = () => {
		this.setState( { showLikesPopover: false } );
	};

	renderCommentCount() {
		const { commentCount: count, postId, showComments, siteSlug, translate } = this.props;

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
							args: { count: formatNumber( count ) },
						} )
					}
				</a>
			</li>
		);
	}

	renderViewCount() {
		const { viewCount: count, postId, showViews, siteSlug, translate } = this.props;
		if ( ! count || count < 1 || ! showViews ) {
			return null;
		}
		const recentViewsText = translate(
			'%(count)s Recent View{{srText}}in the past 30 days{{/srText}}',
			'%(count)s Recent Views{{srText}}in the past 30 days{{/srText}}',
			{
				count,
				args: {
					count: formatNumber( count ),
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
					count: formatNumber( count ),
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
		const { likeCount: count, siteId, postId, showLikes, siteSlug, translate } = this.props;

		if ( count < 1 || ! showLikes ) {
			return null;
		}

		return (
			<li ref={ this.liRef }>
				<a href={ `/stats/post/${ postId }/${ siteSlug }` } onClick={ this.onLikesClick }>
					{
						// translators: count is the number of likes
						translate( '%(count)s Like', '%(count)s Likes', {
							count,
							args: { count: formatNumber( count ) },
						} )
					}
				</a>
				{ this.state.showLikesPopover && (
					<PostLikesPopover
						siteId={ siteId }
						postId={ postId }
						showDisplayNames
						context={ this.liRef.current }
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
		};
	},
	{
		recordTracksEvent,
	}
)( localize( PostActionCounts ) );
