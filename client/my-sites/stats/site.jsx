/**
 * External dependencies
 */
var page = require( 'page' ),
	React = require( 'react' ),
	store = require( 'store' ),
	debug = require( 'debug' )( 'calypso:stats:site' ),
	url = require( 'url' );
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
var StatsNavigation = require( './stats-navigation' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	DatePicker = require( './stats-date-picker' ),
	Comments = require( './stats-comments' ),
	Countries = require( './stats-countries' ),
	Followers = require( './stats-followers' ),
	ChartTabs = require( './stats-chart-tabs' ),
	StatsModule = require( './stats-module' ),
	statsStrings = require( './stats-strings' ),
	titlecase = require( 'to-title-case' ),
	analytics = require( 'analytics' ),
	config = require( 'config' ),
	user = require( 'lib/user' )(),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatsSite',

	getInitialState: function() {
		var scrollPosition = this.props.context.state.scrollPosition || 0;

		return {
			date: this.props.date,
			chartDate: this.props.date,
			chartTab: this.props.chartTab,
			tabSwitched: false,
			period: this.props.period.period,
			scrollPosition: scrollPosition
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		var newDate = this.moment( nextProps.date ),
			newState = {
				date: newDate,
				chartDate: newDate
			};

		if ( ! this.state.tabSwitched || ( this.state.period !== nextProps.period.period ) ) {
			newState.chartTab = nextProps.chartTab;
			newState.period = nextProps.period.period;
			newState.tabSwitched = true;
		}

		this.setState( newState );
	},

	scrollTop: function() {
		if ( window.pageYOffset ) {
			return window.pageYOffset;
		}
		return document.documentElement.clientHeight ? document.documentElement.scrollTop : document.body.scrollTop;
	},

	componentDidMount: function() {
		var scrollPosition = this.state.scrollPosition,
			localKey = 'statsHide' + this.props.siteId,
			hiddenSiteModules = store.get( localKey ) || [];

		setTimeout( function() {
			window.scrollTo( 0, scrollPosition );
		} );

		if ( hiddenSiteModules.length ) {
			analytics.mc.bumpStat( 'calypso_stats_mod_hidden', hiddenSiteModules.length );
		}
	},

	updateScrollPosition: function() {
		this.props.context.state.scrollPosition = this.scrollTop();
		this.props.context.save();
	},

	// When user clicks on a bar, set the date to the bar's period
	chartBarClick: function( bar ) {
		page.redirect( this.props.path + '?startDate=' + bar.period );
	},

	trackOldStats: function() {
		var oldStatsLocation = ( 'wp-admin' === store.get( 'oldStatsLink' ) ) ? 'wp-admin' : 'my-stats';
		analytics.mc.bumpStat( 'calypso_stats_return', oldStatsLocation );
		analytics.ga.recordEvent( 'Stats', 'Clicked Visit Old Stats Page Button', oldStatsLocation );
	},

	barClick: function( bar ) {
		analytics.ga.recordEvent( 'Stats', 'Clicked Chart Bar' );
		page.redirect( this.props.path + '?startDate=' + bar.data.period );
	},

	switchChart: function( tab ) {
		if ( ! tab.loading && tab.attr !== this.state.chartTab ) {
			analytics.ga.recordEvent( 'Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			this.setState( {
				chartTab: tab.attr,
				tabSwitched: true
			} );
		}
	},

	render: function() {
		var site = this.props.sites.getSite( this.props.siteId ),
			charts = this.props.charts(),
			queryDate = this.props.date.format( 'YYYY-MM-DD' ),
			oldStatsLink = 'https://wordpress.com/my-stats/?poll=1&blog=' + this.props.siteId,
			currentUser = user.get(),
			period = this.props.period.period,
			moduleStrings = statsStrings(),
			oldStatsMessage = null,
			tagsList,
			nonPeriodicModules,
			videoList;

		debug( 'Rendering site stats component', this.props );

		if ( ! site.jetpack && 'wp-admin' === store.get( 'oldStatsLink' ) ) {
			oldStatsLink = url.resolve( site.options.admin_url, 'index.php?poll=1&page=stats' );
		}

		// Only display the "old stats" link to users who have a concept of old stats.
		// 83541513 was the max user id on 2015-03-25
		if ( currentUser.ID < 83541513 ) {
			oldStatsMessage = <div className="stats-message stats switch-stats">
								<p>
									<a
										onClick={ this.trackOldStats }
										href={ oldStatsLink }
										className="button"
										target="_blank"
										rel="external"
									>
										{ this.translate( 'Visit the old stats page',
											{ context: 'Button at the bottom of the Stats page' }
										) }
											<Gridicon icon="external" size={ 18 } />
									</a>
								</p>
							</div>;
		}

		if ( site ) {
			// Video plays, and tags and categories are not supported in JetPack Stats
			if ( ! site.jetpack ) {
				tagsList = <StatsModule
					path={ 'tags-categories' }
					moduleStrings={ moduleStrings.tags }
					site={ site }
					dataList={ this.props.tagsList }
					period={ this.props.period }
					date={ queryDate }
					beforeNavigate={ this.updateScrollPosition } />;
				videoList = <StatsModule
					path={ 'videoplays' }
					moduleStrings={ moduleStrings.videoplays }
					site={ site }
					dataList={ this.props.videoPlaysList }
					period={ this.props.period }
					date={ queryDate }
					beforeNavigate={ this.updateScrollPosition } />;
			}
		}

		return (
			<div className="main main-column" role="main">
				<SidebarNavigation />
				<StatsNavigation
					section={ period }
					site={ site } />
				<div id="my-stats-content">
					<ChartTabs
						visitsList={ this.props.visitsList }
						activeTabVisitsList={ this.props.activeTabVisitsList }
						barClick={ this.barClick }
						switchTab={ this.switchChart }
						charts={ charts }
						queryDate={ queryDate }
						period={ this.props.period }
						chartTab={ this.state.chartTab } />
					<DatePicker
						period={ period }
						date={ this.state.chartDate } />
					<div className="module-list is-events">
						<div className="module-column">
							<StatsModule
								path={ 'posts' }
								moduleStrings={ moduleStrings.posts }
								site={ site }
								dataList={ this.props.postsPagesList }
								period={ this.props.period }
								date={ queryDate }
								beforeNavigate={ this.updateScrollPosition } />
							<StatsModule
								path={ 'referrers' }
								moduleStrings={ moduleStrings.referrers }
								site={ site }
								dataList={ this.props.referrersList }
								period={ this.props.period }
								date={ queryDate }
								beforeNavigate={ this.updateScrollPosition } />
							<StatsModule
								path={ 'clicks' }
								moduleStrings={ moduleStrings.clicks }
								site={ site }
								dataList={ this.props.clicksList }
								period={ this.props.period }
								date={ queryDate }
								beforeNavigate={ this.updateScrollPosition } />
							<StatsModule
								path={ 'authors' }
								moduleStrings={ moduleStrings.authors }
								site={ site }
								dataList={ this.props.authorsList }
								period={ this.props.period }
								date={ queryDate }
								followList={ this.props.followList }
								className='authorviews'
								beforeNavigate={ this.updateScrollPosition } />
						</div>
						<div className="module-column">
							<Countries
								path={ 'countries' }
								site={ site }
								dataList={ this.props.countriesList }
								period={ this.props.period }
								date={ queryDate } />
							<StatsModule
								path={ 'searchterms' }
								moduleStrings={ moduleStrings.search }
								site={ site }
								dataList={ this.props.searchTermsList }
								period={ this.props.period }
								date={ queryDate }
								beforeNavigate={ this.updateScrollPosition } />
							{ videoList }
						</div>
					</div>
					{ nonPeriodicModules }
				</div>
			</div>
		);
	}
} );
