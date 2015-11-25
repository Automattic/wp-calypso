/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	debug = require( 'debug' )( 'calypso:stats:postPerformance' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	PostListStore = require( 'lib/posts/post-list-store-factory' )(),
	PostStatsStore = require( 'lib/post-stats/store' ),
	Emojify = require( 'components/emojify' ),
	actions = require( 'lib/posts/actions' ),
	Gridicon = require( 'components/gridicon' );

function getPostState() {
	var posts = PostListStore.getAll(),
		post = posts.length ? posts[ 0 ] : null;
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

module.exports = React.createClass( {

	displayName: 'StatsPostPerformance',

	propTypes: {
		site: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] )
	},

	componentWillMount: function() {
		PostListStore.on( 'change', this.onPostsChange );
		queryPosts( this.props.site.ID );
		PostStatsStore.on( 'change', this.onViewsChange );
	},

	componentWillUnmount: function() {
		PostListStore.off( 'change', this.onPostsChange );
		PostStatsStore.off( 'change', this.onViewsChange );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.site.ID !== this.props.siteID ) {
			queryPosts( nextProps.site.ID );
		}
	},

	getInitialState: function() {
		return {
			loading: true,
			post: null,
			postID: null,
			views: String.fromCharCode( 8211 )
		};
	},

	onPostsChange: function() {
		var postState = getPostState();

		this.setState( postState );
	},

	onViewsChange: function() {
		var views = this.getTotalViews();

		if ( this.state.views !== views ) {
			this.setState( {
				views: this.getTotalViews()
			} );
		}
	},

	getTotalViews: function() {
		var views = null;

		if ( this.state.post ) {
			views = PostStatsStore.getItem( 'totalViews', this.props.site.ID, this.state.post.ID );
		}

		return views;
	},

	buildTabs: function( summaryUrl ) {
		var post = this.state.post,
			isLoading = this.state.loading,
			emptyString = String.fromCharCode( 8211 ),
			values = {
				views: this.state.views,
				likes: post ? post.like_count : emptyString,
				comments: post ? post.discussion.comment_count : emptyString
			},
			tabs = [
				{ label: this.translate( 'Views' ), labelIcon: 'visible', value: values.views, link: summaryUrl },
				{ label: this.translate( 'Likes' ), labelIcon: 'star', value: values.likes },
				{ label: this.translate( 'Comments' ), labelIcon: 'comment', value: values.comments }
			];

		return tabs.map( function( tabOptions, index ) {
			var valueClass = classNames( 'value', { 'is-low': tabOptions.value === 0 } ),
				wrapperClass = classNames( {
					'module-tab': true,
					'is-post-summary': true,
					'is-loading': isLoading
				} ),
				tabInnerClass = classNames( {
					'no-link': ! tabOptions.link
				} ),
				tabContent;

			tabContent = (
				<span className={ tabInnerClass }>
					<Gridicon icon={ tabOptions.labelIcon } size={ 18 } />
					<span className="label">
						{ tabOptions.label }
					</span>
					<span className={ valueClass }>{ tabOptions.value }</span>
				</span>
			);

			return (
				<li className={ wrapperClass } key={ index }>
					{ tabOptions.link ? ( <a href={ summaryUrl }>{ tabContent }</a> ) : tabContent }
				</li>
			);
		} );
	},

	render: function() {
		var post = this.state.post,
			postTime = post ? this.moment( post.date ) : this.moment(),
			cardClass = classNames( {
				'is-loading': this.state.loading,
				'stats__latest-post-summary': true,
				'stats-module': true,
				'is-site-overview': true,
				'is-hidden': ! this.state.loading && ! this.state.post
			} ),
			summaryUrl = post ? '/stats/post/' + post.ID + '/' + this.props.site.slug : '#',
			postTitle;

		if ( post ) {
			if ( !post.title ) {
				postTitle = this.translate( '(no title)' );
			} else {
				postTitle = post.title;
			}
		}

		debug( 'rendering', this.state );

		return (
			<Card className={ cardClass }>
				<div className="module-header">
					<h3 className="module-header-title">
						<a href={ summaryUrl } className="module-header__link">
							<span className="module-header__right-icon">
								<Gridicon icon="stats" />
							</span>
							{ this.translate( 'Latest Post Summary' ) }
						</a>
					</h3>
				</div>
				<div className="module-content-text">
					{ post ?
						(
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
				<ul className="module-tabs">
					{ this.buildTabs( summaryUrl ) }
				</ul>
			</Card>
		);
	}
} );
