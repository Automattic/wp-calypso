/**
 * External dependencies
 */
import page from 'page';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize, translate } from 'i18n-calypso';
import { parse as parseQs, stringify as stringifyQs } from 'qs';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import StatsPeriodNavigation from './stats-period-navigation';
import Main from 'calypso/components/main';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import DatePicker from './stats-date-picker';
import Countries from './stats-countries';
import ChartTabs from './stats-chart-tabs';
import Cloudflare from './cloudflare';
import StatsModule from './stats-module';
import statsStrings from './stats-strings';
import titlecase from 'to-title-case';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import StickyPanel from 'calypso/components/sticky-panel';
import JetpackBackupCredsBanner from 'calypso/blocks/jetpack-backup-creds-banner';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { isJetpackSite, getSitePlanSlug, getSiteOption } from 'calypso/state/sites/selectors';
import {
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import PrivacyPolicyBanner from 'calypso/blocks/privacy-policy-banner';
import QuerySiteKeyrings from 'calypso/components/data/query-site-keyrings';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections';
import memoizeLast from 'calypso/lib/memoize-last';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import EmptyContent from 'calypso/components/empty-content';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import Banner from 'calypso/components/banner';
import isVipSite from 'calypso/state/selectors/is-vip-site';

function updateQueryString( query = {} ) {
	return {
		...parseQs( window.location.search.substring( 1 ) ),
		...query,
	};
}

const memoizedQuery = memoizeLast( ( period, endOf ) => ( {
	period,
	date: endOf.format( 'YYYY-MM-DD' ),
} ) );

const CHARTS = [
	{
		attr: 'views',
		legendOptions: [ 'visitors' ],
		gridicon: 'visible',
		label: translate( 'Views', { context: 'noun' } ),
	},
	{
		attr: 'visitors',
		gridicon: 'user',
		label: translate( 'Visitors', { context: 'noun' } ),
	},
	{
		attr: 'likes',
		gridicon: 'star',
		label: translate( 'Likes', { context: 'noun' } ),
	},
	{
		attr: 'comments',
		gridicon: 'comment',
		label: translate( 'Comments', { context: 'noun' } ),
	},
];

const getActiveTab = ( chartTab ) => find( CHARTS, { attr: chartTab } ) || CHARTS[ 0 ];
class StatsSite extends Component {
	static defaultProps = {
		chartTab: 'views',
	};

	// getDerivedStateFromProps will set the state both on init and tab switch
	state = {
		activeTab: null,
		activeLegend: null,
	};

	static getDerivedStateFromProps( props, state ) {
		// when switching from one tab to another or when initializing the component,
		// reset the active legend charts to the defaults for that tab. The legends
		// can be then toggled on and off by the user in `onLegendClick`.
		const activeTab = getActiveTab( props.chartTab );
		if ( activeTab !== state.activeTab ) {
			return {
				activeTab,
				activeLegend: activeTab.legendOptions || [],
			};
		}
		return null;
	}

	getAvailableLegend() {
		const activeTab = getActiveTab( this.props.chartTab );
		return activeTab.legendOptions || [];
	}

	barClick = ( bar ) => {
		this.props.recordGoogleEvent( 'Stats', 'Clicked Chart Bar' );
		const updatedQs = stringifyQs( updateQueryString( { startDate: bar.data.period } ) );
		page.redirect( `${ window.location.pathname }?${ updatedQs }` );
	};

	onChangeLegend = ( activeLegend ) => this.setState( { activeLegend } );

	switchChart = ( tab ) => {
		if ( ! tab.loading && tab.attr !== this.props.chartTab ) {
			this.props.recordGoogleEvent( 'Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			// switch the tab by navigating to route with updated query string
			const updatedQs = stringifyQs( updateQueryString( { tab: tab.attr } ) );
			page.show( `${ window.location.pathname }?${ updatedQs }` );
		}
	};

	renderStats() {
		const { date, hasWordAds, siteId, slug, isAdmin, isJetpack, isVip } = this.props;

		const queryDate = date.format( 'YYYY-MM-DD' );
		const { period, endOf } = this.props.period;
		const moduleStrings = statsStrings();
		let fileDownloadList;

		const query = memoizedQuery( period, endOf );

		// File downloads are not yet supported in Jetpack Stats
		if ( ! isJetpack ) {
			fileDownloadList = (
				<StatsModule
					path="filedownloads"
					moduleStrings={ moduleStrings.filedownloads }
					period={ this.props.period }
					query={ query }
					statType="statsFileDownloads"
					showSummaryLink
					useShortLabel={ true }
				/>
			);
		}

		return (
			<>
				<PrivacyPolicyBanner />
				<SidebarNavigation />
				<JetpackBackupCredsBanner event={ 'stats-backup-credentials' } />
				<FormattedHeader
					brandFont
					className="stats__section-header"
					headerText={ translate( 'Stats and Insights' ) }
					align="left"
				/>
				<StatsNavigation
					selectedItem={ 'traffic' }
					interval={ period }
					siteId={ siteId }
					slug={ slug }
				/>
				<div id="my-stats-content">
					<ChartTabs
						activeTab={ getActiveTab( this.props.chartTab ) }
						activeLegend={ this.state.activeLegend }
						availableLegend={ this.getAvailableLegend() }
						onChangeLegend={ this.onChangeLegend }
						barClick={ this.barClick }
						switchTab={ this.switchChart }
						charts={ CHARTS }
						queryDate={ queryDate }
						period={ this.props.period }
						chartTab={ this.props.chartTab }
					/>

					{ ! isVip && isAdmin && ! hasWordAds && <Cloudflare /> }

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
							{ fileDownloadList }
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
							<StatsModule
								path="videoplays"
								moduleStrings={ moduleStrings.videoplays }
								period={ this.props.period }
								query={ query }
								statType="statsVideoPlays"
								showSummaryLink
							/>
						</div>
					</div>
					{ ! isVip && isAdmin && ! hasWordAds && (
						<Banner
							className="stats__upsell-nudge"
							icon="star"
							title={ translate( 'Start earning money now' ) }
							description={ translate(
								'Accept payments for just about anything and turn your website into a reliable source of income with payments and ads.'
							) }
							href={ `/earn/${ slug }` }
							event="stats_earn_nudge"
							tracksImpressionName="calypso_upgrade_nudge_impression"
							tracksClickName="calypso_upgrade_nudge_cta_click"
							showIcon={ true }
							jetpack={ false }
						/>
					) }
				</div>
				<JetpackColophon />
			</>
		);
	}

	enableStatsModule = () => {
		const { siteId, path } = this.props;
		this.props.enableJetpackStatsModule( siteId, path );
	};

	renderEnableStatsModule() {
		return (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-404.svg"
				title={ translate( 'Looking for stats?' ) }
				line={ translate(
					'Enable site stats to see detailed information about your traffic, likes, comments, and subscribers.'
				) }
				action={ translate( 'Enable Site Stats' ) }
				actionCallback={ this.enableStatsModule }
			/>
		);
	}

	render() {
		const { isJetpack, siteId, showEnableStatsModule } = this.props;
		const { period } = this.props.period;

		return (
			<Main wideLayout={ true }>
				<QueryKeyringConnections />
				{ isJetpack && <QueryJetpackModules siteId={ siteId } /> }
				{ siteId && <QuerySiteKeyrings siteId={ siteId } /> }
				<DocumentHead title={ translate( 'Stats and Insights' ) } />
				<PageViewTracker
					path={ `/stats/${ period }/:site` }
					title={ `Stats > ${ titlecase( period ) }` }
				/>
				{ showEnableStatsModule ? this.renderEnableStatsModule() : this.renderStats() }
			</Main>
		);
	}
}
const enableJetpackStatsModule = ( siteId, path ) =>
	withAnalytics(
		recordTracksEvent( 'calypso_jetpack_module_toggle', {
			module: 'stats',
			path,
			toggled: 'on',
		} ),
		activateModule( siteId, 'stats' )
	);

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		const isVip = isVipSite( state, siteId );
		const showEnableStatsModule =
			siteId && isJetpack && isJetpackModuleActive( state, siteId, 'stats' ) === false;
		return {
			isAdmin: canCurrentUser( state, siteId, 'manage_options' ),
			isJetpack,
			hasWordAds: getSiteOption( state, siteId, 'wordads' ),
			siteId,
			isVip,
			slug: getSelectedSiteSlug( state ),
			planSlug: getSitePlanSlug( state, siteId ),
			showEnableStatsModule,
			path: getCurrentRouteParameterized( state, siteId ),
		};
	},
	{ recordGoogleEvent, enableJetpackStatsModule }
)( localize( StatsSite ) );
