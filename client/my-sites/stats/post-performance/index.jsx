/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';
import Card from 'components/card';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import StatsModulePlaceholder from '../stats-module/placeholder';
import Emojify from 'components/emojify';
import SectionHeader from 'components/section-header';
import QueryPosts from 'components/data/query-posts';
import QueryPostStats from 'components/data/query-post-stats';
import {
	isRequestingSitePostsForQuery,
	getSitePostsForQuery
} from 'state/posts/selectors';
import { getPostStat } from 'state/stats/posts/selectors';

const StatsPostPerformance = React.createClass( {

	displayName: 'StatsPostPerformance',

	propTypes: {
		viewCount: PropTypes.number,
		site: PropTypes.oneOfType( [
			PropTypes.bool,
			PropTypes.object
		] ),
		siteID: PropTypes.number,
		query: PropTypes.object,
		post: PropTypes.object,
		isRequesting: PropTypes.bool
	},

	buildTabs( summaryUrl ) {
		const { viewCount, post, loading } = this.props;
		const tabClassName = 'is-post-summary';

		const tabs = [
			{
				label: this.translate( 'Views' ),
				gridicon: 'visible',
				value: viewCount,
				href: summaryUrl,
				className: tabClassName,
				loading: loading
			},
			{
				label: this.translate( 'Likes' ),
				gridicon: 'star',
				value: post ? post.like_count : null,
				className: tabClassName,
				loading: loading
			},
			{
				label: this.translate( 'Comments' ),
				gridicon: 'comment',
				value: post ? post.discussion.comment_count : null,
				className: tabClassName,
				loading: loading
			}
		];

		return tabs.map( function( tabOptions ) {
			return <StatsTab { ...tabOptions } key={ tabOptions.gridicon } />;
		} );
	},

	recordClickOnNewPostButton() {
		analytics.tracks.recordEvent( 'calypso_stats_new_post_click' );
	},

	render() {
		const { site, query, post, isRequesting } = this.props;
		const loading = ! site || isRequesting;
		const postTime = post ? this.moment( post.date ) : this.moment();
		const cardClass = classNames( 'stats-module', 'stats-post-performance', 'is-site-overview' );

		const newPostUrl = site ? '/post/' + site.slug : '/post';
		const summaryUrl = post ? '/stats/post/' + post.ID + '/' + this.props.site.slug : undefined;
		let postTitle;

		if ( post ) {
			if ( ! post.title ) {
				postTitle = this.translate( '(no title)' );
			} else {
				postTitle = post.title;
			}
		}

		return (
			<div>
				{ site ? <QueryPosts siteId={ site.ID } query={ query } /> : null }
				{ site && post ? <QueryPostStats siteId= { site.ID } postId={ post.ID } stat="views" /> : null }
				<SectionHeader label={ this.translate( 'Latest Post Summary' ) } href={ summaryUrl } />
				<Card className={ cardClass }>
					<StatsModulePlaceholder isLoading={ loading && ! post } />
					{ post
						? (
							<div className="module-content-text">
								<p>
									{ this.translate(
										'It\'s been %(timeLapsed)s since {{href}}{{postTitle/}}{{/href}} was published. Here\'s how the post has performed so far\u2026',
										{
											args: {
												timeLapsed: postTime.fromNow( true )
											},
											components: {
												href: <a href={ post.URL } target="_blank" />,
												postTitle: <Emojify>{ postTitle }</Emojify>
											},
											context: 'Stats: Sentence showing how much time has passed since the last post, and how the stats are'
										} )
									}
								</p>
							</div>
						) : null
					}
					{ ! loading && ! post
						? (
							<div className="module-content-text is-empty-message is-error">
								<p className="stats-post-performance__no-posts-message">
									{ this.translate( 'You haven\'t published any posts yet.' ) }
								</p>
								<div className="stats-post-performance__start-post">
									<Button primary href={ newPostUrl } onClick={ this.recordClickOnNewPostButton }>
										{ this.translate( 'Start a Post' ) }
									</Button>
								</div>
							</div>
						) : null
					}
					{ post
						? (
							<StatsTabs>
								{ this.buildTabs( summaryUrl ) }
							</StatsTabs>
						)
						: null
					}
				</Card>
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const { site } = ownProps;
	const query = { status: 'publish', number: 1 };
	const posts = site ? getSitePostsForQuery( state, site.ID, query ) : null;
	const post = posts && posts.length ? posts[ 0 ] : null;
	const viewCount = post && site ? getPostStat( state, 'views', site.ID, post.ID ) : null;
	const isRequesting = isRequestingSitePostsForQuery( state, site.ID, query );

	return {
		viewCount,
		query,
		post,
		isRequesting
	};
} )( StatsPostPerformance );
