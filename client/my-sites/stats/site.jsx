/** @format */

/**
 * External dependencies
 */

import page from 'page';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { parse as parseQs, stringify as stringifyQs } from 'qs';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
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
import PageViewTracker from 'lib/analytics/page-view-tracker';
import StatsFirstView from './stats-first-view';
import StickyPanel from 'components/sticky-panel';
import JetpackColophon from 'components/jetpack-colophon';
import config from 'config';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSiteOption, isJetpackSite } from 'state/sites/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import PrivacyPolicyBanner from 'blocks/privacy-policy-banner';
import ChecklistBanner from './checklist-banner';
import QuerySiteKeyrings from 'components/data/query-site-keyrings';
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import GoogleMyBusinessStatsNudge from 'blocks/google-my-business-stats-nudge';
import isGoogleMyBusinessStatsNudgeVisibleSelector from 'state/selectors/is-google-my-business-stats-nudge-visible';

function updateQueryString( query = {} ) {
	return {
		...parseQs( window.location.search.substring( 1 ) ),
		...query,
	};
}

class StatsSite extends Component {
	static defaultProps = {
		chartTab: 'views',
	};

	constructor( props ) {
		super( props );
	}

	barClick = bar => {
		this.props.recordGoogleEvent( 'Stats', 'Clicked Chart Bar' );
		const updatedQs = stringifyQs( updateQueryString( { startDate: bar.data.period } ) );
		page.redirect( `${ window.location.pathname }?${ updatedQs }` );
	};

	switchChart = tab => {
		if ( ! tab.loading && tab.attr !== this.props.chartTab ) {
			this.props.recordGoogleEvent( 'Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			const updatedQs = stringifyQs( updateQueryString( { tab: tab.attr } ) );
			page.show( `${ window.location.pathname }?${ updatedQs }` );
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
			period,
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
				<QueryKeyringConnections />
				{ siteId && <QuerySiteKeyrings siteId={ siteId } /> }
				<DocumentHead title={ translate( 'Stats' ) } />
				<PageViewTracker
					path={ `/stats/${ period }/:site` }
					title={ `Stats > ${ titlecase( period ) }` }
				/>
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
					<ChecklistBanner siteId={ siteId } />
					{ config.isEnabled( 'google-my-business' ) &&
						siteId && (
							<GoogleMyBusinessStatsNudge
								siteSlug={ slug }
								siteId={ siteId }
								visible={ isGoogleMyBusinessStatsNudgeVisible }
							/>
						) }
					<ChartTabs
						barClick={ this.barClick }
						switchTab={ this.switchChart }
						charts={ charts }
						queryDate={ queryDate }
						period={ this.props.period }
						chartTab={ this.props.chartTab }
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
			hasPodcasts:
				// Podcasting category slug
				// TODO: remove when settings API is updated for new option
				!! getSiteOption( state, siteId, 'podcasting_archive' ) ||
				// Podcasting category ID
				!! getSiteOption( state, siteId, 'podcasting_category_id' ),
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
