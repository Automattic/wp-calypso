/**
 * External dependencies
 */
import page from 'page';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import MasonryLayout from 'react-masonry-component';

/**
 * Internal dependencies
 */
import StatsPeriodNavigation from './stats-period-navigation';
import Main from 'components/main';
import StatsNavigation from './stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import DatePicker from './stats-date-picker';
import Countries from './stats-countries';
import ChartTabs from './stats-chart-tabs';
import StatsModule from './stats-module';
import statsStrings from './stats-strings';
import titlecase from 'to-title-case';
import StatsFirstView from './stats-first-view';
import StickyPanel from 'components/sticky-panel';
import config from 'config';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSiteOption, isJetpackSite } from 'state/sites/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

class StatsSite extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			chartTab: this.props.chartTab,
			tabSwitched: false
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.state.tabSwitched && this.state.chartTab !== nextProps.chartTab ) {
			this.setState( {
				tabSwitched: true,
				chartTab: nextProps.chartTab
			} );
		}
	}

	barClick = ( bar ) => {
		this.props.recordGoogleEvent( 'Stats', 'Clicked Chart Bar' );
		page.redirect( this.props.path + '?startDate=' + bar.data.period );
	};

	switchChart = ( tab ) => {
		if ( ! tab.loading && tab.attr !== this.state.chartTab ) {
			this.props.recordGoogleEvent( 'Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			this.setState( {
				chartTab: tab.attr,
				tabSwitched: true
			} );
		}
	};

	render() {
		const { date, isJetpack, hasPodcasts, slug, translate } = this.props;
		const charts = [
			{ attr: 'views', legendOptions: [ 'visitors' ], gridicon: 'visible',
				label: translate( 'Views', { context: 'noun' } ) },
			{ attr: 'visitors', gridicon: 'user', label: translate( 'Visitors', { context: 'noun' } ) },
			{ attr: 'likes', gridicon: 'star', label: translate( 'Likes', { context: 'noun' } ) },
			{ attr: 'comments', gridicon: 'comment', label: translate( 'Comments', { context: 'noun' } ) }
		];
		const queryDate = date.format( 'YYYY-MM-DD' );
		const { period, endOf } = this.props.period;
		const moduleStrings = statsStrings();
		let videoList;
		let podcastList;

		const query = {
			period: period,
			date: endOf.format( 'YYYY-MM-DD' )
		};

		// Video plays, and tags and categories are not supported in JetPack Stats
		if ( ! isJetpack ) {
			videoList = (
				<div className="stats__grid-item">
					<StatsModule
						path="videoplays"
						moduleStrings={ moduleStrings.videoplays }
						period={ this.props.period }
						query={ query }
						statType="statsVideoPlays"
						showSummaryLink
					/>
				</div>
			);
		}
		if ( config.isEnabled( 'manage/stats/podcasts' ) && hasPodcasts ) {
			podcastList = (
				<div className="stats__grid-item">
					<StatsModule
						path="podcastdownloads"
						moduleStrings={ moduleStrings.podcastdownloads }
						period={ this.props.period }
						query={ query }
						statType="statsPodcastDownloads"
						showSummaryLink
					/>
				</div>
			);
		}

		return (
			<Main maxWidthLayout>
				<StatsFirstView />
				<SidebarNavigation />
				<StatsNavigation section={ period } />
				<div id="my-stats-content">
					<StickyPanel className="stats__sticky-navigation">
						<StatsPeriodNavigation
							date={ date }
							period={ period }
							url={ `/stats/${ period }/${ slug }` }
						>
							<DatePicker
								period={ period }
								date={ date }
								query={ query }
								statsType="statsTopPosts"
								showQueryDate
							/>
						</StatsPeriodNavigation>
					</StickyPanel>
					<div className="stats__module-list is-events">
						<MasonryLayout
							className="stats__masonry-items"
							options={ {
								columnWidth: '.stats__grid-sizer',
								itemSelector: '.stats__grid-item',
								gutter: '.stats__gutter-sizer',
								percentPosition: true
							} }
						>
							<div className="stats__grid-sizer"></div>
							<div className="stats__gutter-sizer"></div>
							<div className="stats__grid-item stats__grid-large-item">
								<ChartTabs
									barClick={ this.barClick }
									switchTab={ this.switchChart }
									charts={ charts }
									queryDate={ queryDate }
									period={ this.props.period }
									chartTab={ this.state.chartTab } />
							</div>
							<div className="stats__grid-item">
								<StatsModule
									path="posts"
									moduleStrings={ moduleStrings.posts }
									period={ this.props.period }
									query={ query }
									statType="statsTopPosts"
									showSummaryLink />
							</div>
							<div className="stats__grid-item">
								<Countries
									path="countries"
									period={ this.props.period }
									query={ query }
									summary={ false } />
							</div>
							<div className="stats__grid-item">
								<StatsModule
									path="referrers"
									moduleStrings={ moduleStrings.referrers }
									period={ this.props.period }
									query={ query }
									statType="statsReferrers"
									showSummaryLink />
							</div>
							<div className="stats__grid-item">
								<StatsModule
									path="clicks"
									moduleStrings={ moduleStrings.clicks }
									period={ this.props.period }
									query={ query }
									statType="statsClicks"
									showSummaryLink />
							</div>
							<div className="stats__grid-item">
								<StatsModule
									path="authors"
									moduleStrings={ moduleStrings.authors }
									period={ this.props.period }
									query={ query }
									statType="statsTopAuthors"
									className="stats__author-views"
									showSummaryLink />
							</div>
							<div className="stats__grid-item">
								<StatsModule
									path="searchterms"
									moduleStrings={ moduleStrings.search }
									period={ this.props.period }
									query={ query }
									statType="statsSearchTerms"
									showSummaryLink />
							</div>
							{ videoList }
							{ podcastList }
						</MasonryLayout>
					</div>
				</div>
			</Main>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		return {
			isJetpack: isJetpackSite( state, siteId ),
			hasPodcasts: getSiteOption( state, siteId, 'podcasting_archive' ),
			slug: getSelectedSiteSlug( state )
		};
	},
	{  recordGoogleEvent }
)( localize( StatsSite ) );
