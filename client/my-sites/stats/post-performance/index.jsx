import config from '@automattic/calypso-config';
import { Button, Card } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPostStats from 'calypso/components/data/query-post-stats';
import QueryPosts from 'calypso/components/data/query-posts';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import SectionHeader from 'calypso/components/section-header';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isRequestingPostsForQuery, getPostsForQuery } from 'calypso/state/posts/selectors';
import { getPostStat } from 'calypso/state/stats/posts/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';

import './style.scss';

class StatsPostPerformance extends Component {
	static propTypes = {
		viewCount: PropTypes.number,
		siteId: PropTypes.number,
		query: PropTypes.object,
		post: PropTypes.object,
		isRequesting: PropTypes.bool,
		translate: PropTypes.func,
	};

	buildTabs() {
		const { viewCount, post, loading, translate } = this.props;
		const tabClassName = 'is-post-summary';

		const tabs = [
			{
				label: translate( 'Views' ),
				gridicon: 'visible',
				value: viewCount,
				className: tabClassName,
				loading: loading,
				compact: true,
			},
			{
				label: translate( 'Likes' ),
				gridicon: 'star',
				value: post ? post.like_count : null,
				className: tabClassName,
				loading: loading,
				compact: true,
			},
			{
				label: translate( 'Comments' ),
				gridicon: 'comment',
				value: post ? post.discussion.comment_count : null,
				className: tabClassName,
				loading: loading,
				compact: true,
			},
		];

		return tabs.map( function ( tabOptions ) {
			return <StatsTab { ...tabOptions } key={ tabOptions.gridicon } />;
		} );
	}

	recordClickOnNewPostButton = () => {
		this.props.recordTracksEvent( 'calypso_stats_new_post_click' );
	};

	render() {
		const { query, post, isRequesting, translate, moment, slug, siteId, isOdysseyStats } =
			this.props;
		const loading = ! siteId || isRequesting;
		const postTime = post ? moment( post.date ) : moment();
		const cardClass = classNames( 'stats-module', 'stats-post-performance', 'is-site-overview' );

		const newPostUrl = slug ? '/post/' + slug : '/post';
		const summaryUrl = slug && post ? '/stats/post/' + post.ID + '/' + slug : undefined;
		let postTitle;

		if ( post ) {
			if ( ! post.title ) {
				postTitle = translate( '(no title)' );
			} else {
				postTitle = post.title;
			}
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="list-latest-post-summary">
				{ siteId && <QueryPosts siteId={ siteId } query={ query } /> }
				{ siteId && post && (
					<QueryPostStats siteId={ siteId } postId={ post.ID } fields={ [ 'views' ] } />
				) }
				<SectionHeader label={ translate( 'Latest post summary' ) } href={ summaryUrl } />
				<Card className={ cardClass }>
					<StatsModulePlaceholder isLoading={ loading && ! post } />
					{ post ? (
						<div className="module-content-text">
							<p>
								{ translate(
									"It's been %(timeLapsed)s since {{href}}{{postTitle/}}{{/href}} was published. Here's how the post has performed so far\u2026",
									{
										args: {
											timeLapsed: postTime.fromNow( true ),
										},
										components: {
											href: <a href={ post.URL } target="_blank" rel="noopener noreferrer" />,
											postTitle: <span>{ postTitle }</span>,
										},
										context:
											'Stats: Sentence showing how much time has passed since the last post, and how the stats are',
									}
								) }
							</p>
						</div>
					) : null }
					{ ! loading && ! post ? (
						<div className="module-content-text is-empty-message is-error">
							<p className="stats-post-performance__no-posts-message">
								{ translate( "You haven't published any posts yet." ) }
							</p>
							{ ! isOdysseyStats && (
								<div className="stats-post-performance__start-post">
									<Button primary href={ newPostUrl } onClick={ this.recordClickOnNewPostButton }>
										{ translate( 'Start a Post' ) }
									</Button>
								</div>
							) }
						</div>
					) : null }
					{ post ? <StatsTabs compact>{ this.buildTabs() }</StatsTabs> : null }
				</Card>
			</div>
		);
		/* eslint-enable */
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const query = { status: 'publish', number: 1 };
		const posts = siteId ? getPostsForQuery( state, siteId, query ) : null;
		const post = posts && posts.length ? posts[ 0 ] : null;
		const viewCount = post && siteId ? getPostStat( state, siteId, post.ID, 'views' ) : null;
		const isRequesting = isRequestingPostsForQuery( state, siteId, query );

		return {
			slug: getSelectedSiteSlug( state ),
			isRequesting,
			post,
			query,
			siteId,
			viewCount,
			isOdysseyStats: config.isEnabled( 'is_running_in_jetpack_site' ),
		};
	},
	{ recordTracksEvent }
);

export default flowRight( connectComponent, localize, withLocalizedMoment )( StatsPostPerformance );
