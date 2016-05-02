/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PostStatsStore from 'lib/post-stats/store';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import Emojify from 'components/emojify';
import SectionHeader from 'components/section-header';
import QueryPosts from 'components/data/query-posts';
import {
	getSitePostsForQuery,
	isRequestingSitePostsForQuery
} from 'state/posts/selectors';
import { decodeEntities } from 'lib/formatting';

function getPostState( post ) {
	return {
		views: post ? PostStatsStore.getItem( 'totalViews', post.site_ID, post.ID ) : String.fromCharCode( 8211 )
	};
}

const StatsPostPerformance = React.createClass( {

	displayName: 'StatsPostPerformance',

	propTypes: {
		site: PropTypes.oneOfType( [
			PropTypes.bool,
			PropTypes.object
		] ),
		siteID: PropTypes.number,
		query: PropTypes.object,
		post: PropTypes.object,
		loading: PropTypes.bool
	},

	componentWillMount() {
		const post = this.props.post;
		if ( post ) {
			this.updatePostViews( post );
		}
		PostStatsStore.on( 'change', this.onViewsChange );
	},

	componentWillUnmount() {
		PostStatsStore.off( 'change', this.onViewsChange );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.post !== this.props.post ) {
			this.updatePostViews( nextProps.post );
		}
	},

	getInitialState() {
		return {
			views: null
		};
	},

	updatePostViews( post ) {
		const postState = getPostState( post );

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

		if ( this.props.post ) {
			views = PostStatsStore.getItem( 'totalViews', this.props.site.ID, this.props.post.ID );
		}

		return views;
	},

	buildTabs( summaryUrl ) {
		const { views } = this.state;
		const { post, loading } = this.props;
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
		const { site, query, post, loading } = this.props;
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
				postTitle = decodeEntities( post.title );
			}
		}

		return (
			<div>
				{ site
					? <QueryPosts siteId={ site.ID } query={ query } />
					: null
				}
				<SectionHeader label={ this.translate( 'Latest Post Summary' ) } href={ summaryUrl } />
				<Card className={ cardClass }>
					<div className="module-content-text">
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
					</div>
					<StatsTabs>
						{ this.buildTabs( summaryUrl ) }
					</StatsTabs>
				</Card>
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const { site } = ownProps;
	const query = { status: 'published' };
	const posts = site ? getSitePostsForQuery( state, site.ID, query ) : null;
	const post = posts && posts.length ? posts[ 0 ] : null;
	return {
		query,
		post,
		loading: isRequestingSitePostsForQuery( state, site.ID, query )
	};
} )( StatsPostPerformance );
