/** @format */

/**
 * External dependencies
 */

import page from 'page';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StatsPeriodNavigation from './stats-period-navigation';
import Main from 'components/main';
import StatsNavigation from 'blocks/stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import DatePicker from './stats-date-picker';
import Countries from './stats-countries';
import ChartTabs from './stats-chart-tabs';
import StatsModule from './stats-module';
import statsStrings from './stats-strings';
import titlecase from 'to-title-case';
import StatsFirstView from './stats-first-view';
import StickyPanel from 'components/sticky-panel';
import JetpackColophon from 'components/jetpack-colophon';
import config from 'config';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSiteOption, isJetpackSite } from 'state/sites/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import PrivacyPolicyBanner from 'blocks/privacy-policy-banner';
import ChecklistBanner from './checklist-banner';
import GoogleMyBusinessStatsNudge from 'blocks/google-my-business/stats-nudge';
import { isGoogleMyBusinessStatsNudgeVisible as isGoogleMyBusinessStatsNudgeVisibleSelector } from 'state/selectors';

class StatsSite extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			chartTab: this.props.chartTab,
			tabSwitched: false,
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.state.tabSwitched && this.state.chartTab !== nextProps.chartTab ) {
			this.setState( {
				tabSwitched: true,
				chartTab: nextProps.chartTab,
			} );
		}
	}

	barClick = bar => {
		this.props.recordGoogleEvent( 'Stats', 'Clicked Chart Bar' );
		page.redirect( this.props.path + '?startDate=' + bar.data.period );
	};

	switchChart = tab => {
		if ( ! tab.loading && tab.attr !== this.state.chartTab ) {
			this.props.recordGoogleEvent( 'Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			this.setState( {
				chartTab: tab.attr,
				tabSwitched: true,
			} );
		}
	};

	render() {
		const {
			date,
			hasPodcasts,
			isGoogleMyBusinessStatsNudgeVisible,
			isJetpack,
			siteId,
			slug,
			translate,
		} = this.props;

		const charts = [
			{
				attr: 'views',
				legendOptions: [ 'visitors' ],
				gridicon: 'visible',
				label: translate( 'Views', { context: 'noun' } ),
			},
			{ attr: 'visitors', gridicon: 'user', label: translate( 'Visitors', { context: 'noun' } ) },
			{ attr: 'likes', gridicon: 'star', label: translate( 'Likes', { context: 'noun' } ) },
			{
				attr: 'comments',
				gridicon: 'comment',
				label: translate( 'Comments', { context: 'noun' } ),
			},
		];
		const queryDate = date.format( 'YYYY-MM-DD' );
		const { period, endOf } = this.props.period;
		const moduleStrings = statsStrings();
		let videoList;
		let podcastList;

		const query = {
			period: period,
			date: endOf.format( 'YYYY-MM-DD' ),
		};

		// Video plays, and tags and categories are not supported in JetPack Stats
		if ( ! isJetpack ) {
			videoList = (
				<StatsModule
					path="videoplays"
					moduleStrings={ moduleStrings.videoplays }
					period={ this.props.period }
					query={ query }
					statType="statsVideoPlays"
					showSummaryLink
				/>
			);
		}
		if ( config.isEnabled( 'manage/stats/podcasts' ) && hasPodcasts ) {
			podcastList = (
				<StatsModule
					path="podcastdownloads"
					moduleStrings={ moduleStrings.podcastdownloads }
					period={ this.props.period }
					query={ query }
					statType="statsPodcastDownloads"
					showSummaryLink
				/>
			);
		}

		return (
			<Main wideLayout={ true }>
				<PrivacyPolicyBanner />
				<StatsFirstView />
				<SidebarNavigation />
				<StatsNavigation
					selectedItem={ 'traffic' }
					interval={ period }
					siteId={ siteId }
					slug={ slug }
				/>
				<div id="my-stats-content">
					{ config.isEnabled( 'onboarding-checklist' ) && <ChecklistBanner siteId={ siteId } /> }
					{ config.isEnabled( 'google-my-business' ) &&
						isGoogleMyBusinessStatsNudgeVisible && (
							<GoogleMyBusinessStatsNudge siteSlug={ slug } />
						) }
					<ChartTabs
						barClick={ this.barClick }
						switchTab={ this.switchChart }
						charts={ charts }
						queryDate={ queryDate }
						period={ this.props.period }
						chartTab={ this.state.chartTab }
					/>
					<StickyPanel className="stats__sticky-navigation">
						<StatsPeriodNavigation
							date={ date }
							period={ period }
							url={ `/stats/${ period }/${ slug }` }
						>
							<DatePicker
								period={ period }
								date={ date }
								query={ query }
								statsType="statsTopPosts"
								showQueryDate
							/>
						</StatsPeriodNavigation>
					</StickyPanel>
					<div className="stats__module-list is-events">
						<div className="stats__module-column">
							<StatsModule
								path="posts"
								moduleStrings={ moduleStrings.posts }
								period={ this.props.period }
								query={ query }
								statType="statsTopPosts"
								showSummaryLink
							/>
							<StatsModule
								path="searchterms"
								moduleStrings={ moduleStrings.search }
								period={ this.props.period }
								query={ query }
								statType="statsSearchTerms"
								showSummaryLink
							/>
							{ videoList }
						</div>
						<div className="stats__module-column">
							<Countries
								path="countries"
								period={ this.props.period }
								query={ query }
								summary={ false }
							/>
							<StatsModule
								path="clicks"
								moduleStrings={ moduleStrings.clicks }
								period={ this.props.period }
								query={ query }
								statType="statsClicks"
								showSummaryLink
							/>
						</div>
						<div className="stats__module-column">
							<StatsModule
								path="referrers"
								moduleStrings={ moduleStrings.referrers }
								period={ this.props.period }
								query={ query }
								statType="statsReferrers"
								showSummaryLink
							/>
							<StatsModule
								path="authors"
								moduleStrings={ moduleStrings.authors }
								period={ this.props.period }
								query={ query }
								statType="statsTopAuthors"
								className="stats__author-views"
								showSummaryLink
							/>
							{ podcastList }
						</div>
					</div>
				</div>
				<JetpackColophon />
			</Main>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		return {
			isJetpack,
			hasPodcasts: getSiteOption( state, siteId, 'podcasting_archive' ),
			isGoogleMyBusinessStatsNudgeVisible: isGoogleMyBusinessStatsNudgeVisibleSelector(
				state,
				siteId
			),
			siteId,
			slug: getSelectedSiteSlug( state ),
		};
	},
	{ recordGoogleEvent }
)( localize( StatsSite ) );
