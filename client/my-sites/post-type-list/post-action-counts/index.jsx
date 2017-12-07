/* @format */

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
import QueryPostStats from 'components/data/query-post-stats';
import { getNormalizedPost } from 'state/posts/selectors';
import { getPostStat } from 'state/stats/posts/selectors';
import { canCurrentUser } from 'state/selectors';
import { getSiteSlug, isJetpackModuleActive, isJetpackSite } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class PostActionCounts extends PureComponent {
	static propTypes = {
		globalId: PropTypes.string,
	};

	onActionClick = ( action ) => () => {
		const { recordTracksEvent: record, type } = this.props;

		record( 'calypso_post_list_action_click', {
			action,
			postType: type,
			context: 'action_counts',
		} );
	};

	renderCommentCount() {
		const { commentCount: count, numberFormat, postId, showComments, siteSlug, translate } = this.props;

		if ( count < 1 || ! showComments ) {
			return null;
		}

		return (
			<li>
				<a href={ `/comments/all/${ siteSlug }/${ postId }` } onClick={ this.onActionClick( 'comments' ) } >
					{ translate(
						'%(count)s Comment',
						'%(count)s Comments',
						{
							count,
							args: { count: numberFormat( count ) },
						}
					) }
				</a>
			</li>
		);
	}

	renderLikeCount() {
		const { likeCount: count, numberFormat, postId, showLikes, siteSlug, translate } = this.props;

		if ( count < 1 || ! showLikes ) {
			return null;
		}

		return (
			<li>
				<a href={ `/stats/post/${ postId }/${ siteSlug }` } onClick={ this.onActionClick( 'likes' ) } >
					{ translate(
						'%(count)s Like',
						'%(count)s Likes',
						{
							count,
							args: { count: numberFormat( count ) },
						}
					) }
				</a>
			</li>
		);
	}

	renderViewCount() {
		const { viewCount: count, numberFormat, postId, showViews, siteSlug, translate } = this.props;

		if ( count < 1 || ! showViews ) {
			return null;
		}

		return (
			<li>
				<a href={ `/stats/post/${ postId }/${ siteSlug }` } onClick={ this.onActionClick( 'stats' ) } >
					{ translate(
						'%(count)s View',
						'%(count)s Views',
						{
							count,
							args: { count: numberFormat( count ) },
						}
					) }
				</a>
			</li>
		);
	}

	render() {
		const { postId, siteId } = this.props;

		return (
			<ul className="post-action-counts">
				{ siteId && <QueryPostStats siteId={ siteId } postId={ postId } fields={ [ 'views' ] } /> }
				{ this.renderViewCount() }
				{ this.renderLikeCount() }
				{ this.renderCommentCount() }
			</ul>
		);
	}
}

export default connect( ( state, { globalId } ) => {
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
		viewCount: getPostStat( state, siteId, postId, 'views' ),
	};
}, { recordTracksEvent } )( localize( PostActionCounts ) );
