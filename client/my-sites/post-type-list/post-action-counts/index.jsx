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
import { getSiteSlug } from 'state/sites/selectors';

class PostActionCounts extends PureComponent {
	static propTypes = {
		globalId: PropTypes.string,
	};

	renderCommentCount() {
		const { commentCount: count, numberFormat, postId, siteSlug, translate } = this.props;

		return (
			<li>
				<a href={ `/comments/all/${ siteSlug }/${ postId }` }>
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
		const { likeCount: count, numberFormat, postId, siteSlug, translate } = this.props;

		return (
			<li>
				<a href={ `/stats/post/${ postId }/${ siteSlug }` }>
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
		const { viewCount: count, numberFormat, postId, siteSlug, translate } = this.props;

		return (
			<li>
				<a href={ `/stats/post/${ postId }/${ siteSlug }` }>
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
		const { commentCount, likeCount, postId, siteId, viewCount } = this.props;

		return (
			<ul className="post-action-counts">
				{ siteId && <QueryPostStats siteId={ siteId } postId={ postId } fields={ [ 'views' ] } /> }
				{ viewCount > 0 && this.renderViewCount() }
				{ likeCount > 0 && this.renderLikeCount() }
				{ commentCount > 0 && this.renderCommentCount() }
			</ul>
		);
	}
}

export default connect( ( state, { globalId } ) => {
	const post = getNormalizedPost( state, globalId );
	const postId = post && post.ID;
	const siteId = post && post.site_ID;

	return {
		commentCount: get( post, 'discussion.comment_count', null ),
		likeCount: get( post, 'like_count', null ),
		postId,
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		viewCount: getPostStat( state, siteId, postId, 'views' ),
	};
} )( localize( PostActionCounts ) );
