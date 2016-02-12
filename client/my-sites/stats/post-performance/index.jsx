/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PostListStoreFactory from 'lib/posts/post-list-store-factory';
import PostStatsStore from 'lib/post-stats/store';
import StatsModuleHeader from '../stats-module/header';
import StatsModuleContent from '../stats-module/content-text';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import Emojify from 'components/emojify';
import actions from 'lib/posts/actions';

const PostListStore = new PostListStoreFactory;

function getPostState() {
	const posts = PostListStore.getAll();
	const post = posts.length ? posts[ 0 ] : null;

	return {
		post: post,
		postID: post ? post.ID : null,
		loading: PostListStore.isFetchingNextPage(),
		views: post ? PostStatsStore.getItem( 'totalViews', post.site_ID, post.ID ) : String.fromCharCode( 8211 )
	};
}

function queryPosts( siteID ) {
	actions.queryPosts( {
		type: 'post',
		siteID: siteID,
		status: 'published'
	} );
	actions.fetchNextPage();
}

export default React.createClass( {

	displayName: 'StatsPostPerformance',

	propTypes: {
		site: PropTypes.oneOfType( [
			PropTypes.bool,
			PropTypes.object
		] ),
		siteID: PropTypes.number
	},

	componentWillMount() {
		PostListStore.on( 'change', this.onPostsChange );
		queryPosts( this.props.site.ID );
		PostStatsStore.on( 'change', this.onViewsChange );
	},

	componentWillUnmount() {
		PostListStore.off( 'change', this.onPostsChange );
		PostStatsStore.off( 'change', this.onViewsChange );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.site.ID !== this.props.siteID ) {
			queryPosts( nextProps.site.ID );
		}
	},

	getInitialState() {
		return {
			loading: true,
			post: null,
			postID: null,
			views: null
		};
	},

	onPostsChange() {
		const postState = getPostState();

		this.setState( postState );
	},

	onViewsChange() {
		const views = this.getTotalViews();

		if ( this.state.views !== views ) {
			this.setState( {
				views: views
			} );
		}
	},

	getTotalViews() {
		let views;

		if ( this.state.post ) {
			views = PostStatsStore.getItem( 'totalViews', this.props.site.ID, this.state.post.ID );
		}

		return views;
	},

	buildTabs( summaryUrl ) {
		const { post, loading, views } = this.state;
		const tabClassName = 'is-post-summary';

		const tabs = [
			{
				label: this.translate( 'Views' ),
				gridicon: 'visible',
				value: views,
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

	render() {
		const { post, loading } = this.state;
		const postTime = post ? this.moment( post.date ) : this.moment();
		const cardClass = classNames( 'stats-module', 'stats__latest-post-summary', 'is-site-overview', {
			'is-loading': loading,
			'is-hidden': ! loading && ! post
		} );

		const summaryUrl = post ? '/stats/post/' + post.ID + '/' + this.props.site.slug : '#';
		let postTitle;

		if ( post ) {
			if ( ! post.title ) {
				postTitle = this.translate( '(no title)' );
			} else {
				postTitle = post.title;
			}
		}

		return (
			<Card className={ cardClass }>
				<StatsModuleHeader
					showActions={ false }
					titleLink={ summaryUrl }
					title={ this.translate( 'Latest Post Summary' ) } />
				<StatsModuleContent>
					{ post
						? (
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
						) : null
					}
				</StatsModuleContent>
				<StatsTabs>
					{ this.buildTabs( summaryUrl ) }
				</StatsTabs>
			</Card>
		);
	}
} );
