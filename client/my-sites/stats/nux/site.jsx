/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' ),
	noop = require( 'lodash/noop' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	StatsNavigation = require( '../stats-navigation' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	ChartTabs = require( '../stats-chart-tabs' ),
	nuxData = require( './data.js' ),
	Countries = require( '../stats-countries' ),
	analytics = require( 'analytics' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' );

module.exports = React.createClass( {
	displayName: 'StatsNuxSite',

	mixins: [ observe( 'countriesList', 'referrersList' ) ],

	getInitialState: function() {
		return {
			countryViews: nuxData.countryViews,
			referrersList: nuxData.referrers,
			chartTab: 'views'
		};
	},

	switchChart: function( tab ) {
		if ( tab.attr !== this.state.charTab ) {
			this.setState( {
				chartTab: tab.attr
			} );
		}
	},

	clickPostLink: function( event ) {
		var site = this.props.sites.getSite( this.props.siteId );
		analytics.tracks.recordEvent( 'calypso_stats_post_click' );
		event.preventDefault();
		page( '/post/' + site.slug );
	},

	buildPromo: function() {
		var promo,
			site = this.props.sites.getSite( this.props.siteId ),
			queryDate = this.props.date.format( 'YYYY-MM-DD' );

		analytics.tracks.recordEvent( 'calypso_stats_post_view' );
		promo = (
			<div className="module-list">
				<div className="module-column">
					<div className="module-overlay"></div>
					<Countries path={ 'countries' } site={ site } dataList={ this.props.countriesList } period={ this.props.period } date={ queryDate } />
				</div>
				<div className="module-column">
					<h1 className="stats-section-title">{ this.translate( 'Want to learn more about how your content performs?' ) }</h1>
					<p className="stats-section-blurb">{ this.translate( 'Attract visitors from around the globe.' ) }</p>
					<button className="button is-primary" onClick={ this.clickPostLink }>{ this.translate( 'Write a Post' ) }</button>
				</div>
			</div>
		);

		return promo;
	},

	render: function() {
		var site = this.props.sites.getSite( this.props.siteId );

		this.props.countriesList.response.data = this.state.countryViews;
		this.props.countriesList.loading = false;

		this.props.referrersList.response.data = this.state.referrersList;
		this.props.referrersList.loading = false;

		return (
			<div className="stats-nux is-period">
				<div className="main main-column" role="main">
					<SidebarNavigation />

					<StatsNavigation section={ this.props.period.period } site={ site } />
					<div id="my-stats-content">
						<ChartTabs visitsList={ this.props.visitsList }
							activeTabVisitsList={ this.props.activeTabVisitsList }
							barClick={ noop }
							switchTab={ this.switchChart }
							charts={ this.props.charts() }
							period={ this.props.period }
							queryDate={ this.props.date.format( 'YYYY-MM-DD' ) }
							chartTab={ this.state.chartTab } />

						<h3 className="stats-section-title">{ this.translate( 'Activate Your Stats Page' ) }</h3>
						{ this.buildPromo() }
					</div>
				</div>
			</div>
		);
	}
} );
