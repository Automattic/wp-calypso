/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	StatsNavigation = require( '../stats-navigation' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	MostPopular = require( '../most-popular' ),
	nuxData = require( './data.js' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	analytics = require( 'analytics' ),
	Card = require( 'components/card' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatsNuxInsights',

	mixins: [ observe( 'insightsList' ) ],

	getInitialState: function() {
		return {
			insightsList: nuxData.insights
		};
	},

	clickPostLink: function( event ) {
		event.preventDefault();
		analytics.tracks.recordEvent( 'calypso_stats_post_click' );
		page( '/post/' + this.props.site.slug );
	},

	buildPostSummary: function() {
		return (
			<Card className="stats__overview stats-module is-site-overview stats-nux">
				<div className="module-header">
					<h3 className="module-header-title">
						{ this.translate( 'Latest Post Summary' ) }
					</h3>
				</div>
				<div className="module-content-text">
					<p>
						{ this.translate(
							'It\'s been %(timeLapsed)s since {{href}}{{postTitle/}}{{/href}} was published. Here\'s how the post has performed so far…',
							{
								args: {
									timeLapsed: '8 hours'
								},
								components: {
									href: <a />,
									postTitle: <span>{ 'Coffee Time' }</span>
								},
								context: 'Stats: Sentence showing how much time has passed since the last post, and how the stats are'
							} )
						}
					</p>
				</div>

				<ul className="module-tabs is-nux">
					<li className="module-tab" key="views">
						<span className="label">
							<Gridicon icon="visible" size={ 18 } />
							<span>{ this.translate( 'Views' ) }</span>
						</span>
						<span className="value">12</span>
					</li>
					<li className="module-tab" key="likes">
						<span className="label">
							<Gridicon icon="star" size={ 18 } />
							<span>{ this.translate( 'Likes' ) }</span>
						</span>
						<span className="value">8</span>
					</li>
					<li className="module-tab" key="comments">
						<span className="label">
							<Gridicon icon="comment" size={ 18 } />
							<span>{ this.translate( 'Comments' ) }</span>
						</span>
						<span className="value">4</span>
					</li>
				</ul>
			</Card>
		);
	},

	buildPromo: function() {
		var content;

		analytics.tracks.recordEvent( 'calypso_stats_post_view' );
		content = (
			<div className="module-list">
				<div className="module-column">
					<div className="module-overlay"></div>
					<MostPopular insightsList={ this.props.insightsList } />
				</div>
				<div className="module-column">
					<h1 className="stats-section-title">{ this.translate( 'Want to learn more about how your content performs?' ) }</h1>
					<p className="stats-section-blurb">{ this.translate( 'Attract new views, likes, and comments.' ) }</p>
					<button className="button is-primary" onClick={ this.clickPostLink }>{ this.translate( 'Write a Post' ) }</button>
				</div>
			</div>
			);

		return content;
	},

	render: function() {
		this.props.insightsList.response = this.state.insightsList;
		this.props.insightsList.loading = false;

		return (
			<div className="stats-nux is-insights">
				<div className="main main-column" role="main">
					<SidebarNavigation />

					<StatsNavigation section="insights" site={ this.props.site } />
					<div id="my-stats-content">
						<h3 className="stats-section-title">{ this.translate( 'Activate Your Stats Page' ) }</h3>
							{ this.buildPromo() }
					</div>
				</div>
			</div>
		);
	}
} );
