/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:stats:stats-overview' ),
	store = require( 'store' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	SiteOverview = require( './overview' ),
	SiteOverviewPlaceholder = require( './module-site-overview-placeholder' ),
	DatePicker = require( './module-date-picker' ),
	StatsNavigation = require( './stats-navigation' ),
	analytics = require( 'analytics' ),
	user = require( 'lib/user' )(),
	Main = require( 'components/main' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatsOverview',

	mixins: [ observe( 'sites' ) ],

	trackOldStats: function() {
		analytics.mc.bumpStat( 'calypso_stats_return', ( 'wp-admin' === store.get( 'oldStatsLink' ) ) ? 'wp-admin' : 'my-stats' );
	},

	render: function() {
		var sites = this.props.sites,
			path = ( this.props.path === '/stats' ) ? '/stats/day' : this.props.path,
			oldStatsLink = ( 'wp-admin' === store.get( 'oldStatsLink' ) ) ? 'https://dashboard.wordpress.com/wp-admin/index.php?poll=1&page=stats' : 'https://wordpress.com/my-stats?poll=1',
			oldStatsMessage = null,
			currentUser = user.get(),
			sitesList;

		debug( 'Render stats component', this.props );

		sites = sites.getVisible();

		sites = sites.map( function( site ) {
			var momentSiteZone = this.moment();

			if ( 'object' === typeof ( site.options ) && 'undefined' !== typeof ( site.options.gmt_offset ) ) {
				momentSiteZone = this.moment().utcOffset( site.options.gmt_offset );
			}
			site.periodEnd = momentSiteZone.endOf( this.props.period ).format( 'YYYY-MM-DD' );
			return site;
		}, this );

		sites.sort( function( a, b ) {
			if ( a.periodEnd > b.periodEnd ) {
				return 1;
			}
			if ( a.periodEnd < b.periodEnd ) {
				return -1;
			}
			if ( a.primary ) {
				return -1;
			}
			if ( b.primary ) {
				return 1;
			}
			if ( a.title.toUpperCase() > b.title.toUpperCase() ) {
				return 1;
			}
			if ( a.title.toUpperCase() < b.title.toUpperCase() ) {
				return -1;
			}
			return 0;
		} );

		sitesList = sites.map( function( site, index, sites ) {
			var siteOffset = 0,
				date,
				summaryData = this.props.statSummaryList.get( site.ID, date ),
				overview = [];

			if ( 'object' === typeof ( site.options ) && 'undefined' !== typeof ( site.options.gmt_offset ) ) {
				siteOffset = site.options.gmt_offset;
			}

			date = this.moment().utcOffset( siteOffset ).format( 'YYYY-MM-DD' );

			if ( 0 === index || sites[ index - 1 ].periodEnd !== site.periodEnd ) {
				overview.push( <DatePicker period={ this.props.period } date={ date } /> );
			}

			overview.push(
				<SiteOverview key={site.ID} site={ site } summaryData={ summaryData } path={ path } />
			);

			return overview;
		}, this );

		// Only display the "old stats" link to users who have a concept of old stats.
		// 83541513 was the max user id on 2015-03-25
		if ( currentUser.ID < 83541513 ) {
			oldStatsMessage = <div className="stats-message stats switch-stats">
				<div className="old-stats-link">
					<p>
						<a
							onClick={ this.trackOldStats }
							href={ oldStatsLink }
							className="button"
							target="_blank"
							rel="external">
							{ this.translate( 'Visit the old stats page', {
								context: 'Button at the bottom of the Stats page'
							} ) }
							<Gridicon icon="external" size={ 18 } />
						</a>
					</p>
				</div>
			</div>;
		}

		return (
			<Main>
				<SidebarNavigation />
				<StatsNavigation section={ this.props.period } />
				<div id="my-stats-content">
					{ sites.length !== 0 ? sitesList : this.placeholders() }
					{ oldStatsMessage }
				</div>
			</Main>
		);
	},

	placeholders: function() {
		// concept borrowed from sites.jsx
		var items = [],
			i, limit;

		limit = Math.min( this.props.user.get().visible_site_count, 10 );

		items.push( <h3 className="stats-section-title">&nbsp;</h3> );

		/**
		 * Display empty boxes as placeholder for the user sites
		 * while those are still being loaded
		 */
		for ( i = 0; i < limit; i++ ) {
			items.push( <SiteOverviewPlaceholder key={i} /> );
		}
		return items;
	}

} );
