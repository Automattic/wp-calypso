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
	analytics = require( 'analytics' );

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
