/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { get } from 'lodash';

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
import queryGraph from 'lib/graph/query';

const StatsPostPerformance = React.createClass( {

	displayName: 'StatsPostPerformance',

	propTypes: {
		site: PropTypes.oneOfType( [
			PropTypes.bool,
			PropTypes.object
		] ),
		results: PropTypes.object
	},

	buildTabs( summaryUrl ) {
		const { results } = this.props;
		const post = get( results, [ 'posts', 0 ], false );
		const viewCount = get( results, [ 'posts', 0, 'stat' ] );
		const tabClassName = 'is-post-summary';

		const tabs = [
			{
				label: this.translate( 'Views' ),
				gridicon: 'visible',
				value: viewCount,
				href: summaryUrl,
				className: tabClassName,
			},
			{
				label: this.translate( 'Likes' ),
				gridicon: 'star',
				value: post ? post.like_count : null,
				className: tabClassName,
			},
			{
				label: this.translate( 'Comments' ),
				gridicon: 'comment',
				value: post ? post.discussion.comment_count : null,
				className: tabClassName,
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
		const { site, results } = this.props;
		const post = get( results, [ 'posts', 0 ], false );
		const isLoadingPosts = ! site || get( results, [ 'requests', 'posts' ], false );
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
				<SectionHeader label={ this.translate( 'Latest Post Summary' ) } href={ summaryUrl } />
				<Card className={ cardClass }>
					<StatsModulePlaceholder isLoading={ isLoadingPosts && ! post } />
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
												href: <a href={ post.URL } target="_blank" rel="noopener noreferrer" />,
												postTitle: <Emojify>{ postTitle }</Emojify>
											},
											context: 'Stats: Sentence showing how much time has passed since the last post, and how the stats are'
										} )
									}
								</p>
							</div>
						) : null
					}
					{ ! isLoadingPosts && ! post
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

export default queryGraph(
	`
		query PostDetailsAndViewStat( $siteId: Int )
		{
			posts( siteId: $siteId, query: { number: 1, status: "publish" } ) {
				ID
				date
				title
				URL
				like_count
				discussion {
					comment_count
				}
				stat( stat: "views" )
			}
			requests {
				posts( siteId: $siteId, query: { number: 1, status: "publish" } )
			}
		}
	`,
	( { site } ) => {
		return {
			siteId: site.ID
		};
	}
)( StatsPostPerformance );
