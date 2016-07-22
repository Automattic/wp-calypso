/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import store from 'store';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import StatsNavigation from './stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import DatePicker from './stats-date-picker';
import Countries from './stats-countries';
import ChartTabs from './stats-chart-tabs';
import StatsModule from './stats-module';
import statsStrings from './stats-strings';
import titlecase from 'to-title-case';
import analytics from 'lib/analytics';
import StatsFirstView from './stats-first-view';

const debug = debugFactory( 'calypso:stats:site' );

module.exports = React.createClass( {
	displayName: 'StatsSite',

	getInitialState: function() {
		const scrollPosition = this.props.context.state.scrollPosition || 0;

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
		const newDate = this.moment( nextProps.date );
		const newState = {
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
		const scrollPosition = this.state.scrollPosition;
		const localKey = 'statsHide' + this.props.siteId;
		const hiddenSiteModules = store.get( localKey ) || [];

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
		const oldStatsLocation = ( 'wp-admin' === store.get( 'oldStatsLink' ) ) ? 'wp-admin' : 'my-stats';
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
		const site = this.props.sites.getSite( this.props.siteId );
		const charts = this.props.charts();
		const queryDate = this.props.date.format( 'YYYY-MM-DD' );
		const period = this.props.period.period;
		const moduleStrings = statsStrings();
		let nonPeriodicModules;
		let videoList;

		debug( 'Rendering site stats component', this.props );

		if ( site ) {
			// Video plays, and tags and categories are not supported in JetPack Stats
			if ( ! site.jetpack ) {
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
			<Main>
				<StatsFirstView />
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
					<div className="stats__module-list is-events">
						<div className="stats__module-column">
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
								className="stats__author-views"
								beforeNavigate={ this.updateScrollPosition } />
						</div>
						<div className="stats__module-column">
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
			</Main>
		);
	}
} );
