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
import DocumentHead from 'components/data/document-head';
import StatsPeriodNavigation from './stats-period-navigation';
import Main from 'components/main';
import StatsNavigation from 'blocks/stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import DatePicker from './stats-date-picker';
import Countries from './stats-countries';
import ChartTabs from './stats-chart-tabs';
import StatsModule from './stats-module';
import statsStrings from './stats-strings';
import titlecase from 'to-title-case';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import StickyPanel from 'components/sticky-panel';
import JetpackBackupCredsBanner from 'blocks/jetpack-backup-creds-banner';
import JetpackColophon from 'components/jetpack-colophon';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite, getSitePlanSlug } from 'state/sites/selectors';
import { recordGoogleEvent, recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import PrivacyPolicyBanner from 'blocks/privacy-policy-banner';
import QuerySiteKeyrings from 'components/data/query-site-keyrings';
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import memoizeLast from 'lib/memoize-last';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import EmptyContent from 'components/empty-content';
import { activateModule } from 'state/jetpack/modules/actions';
import getCurrentRouteParameterized from 'state/selectors/get-current-route-parameterized';

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
		const { date, siteId, slug, isJetpack } = this.props;

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
				<JetpackBackupCredsBanner event={ 'stats-backup-credentials' } />
				<SidebarNavigation />
				<FormattedHeader
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
		const showEnableStatsModule =
			siteId && isJetpack && isJetpackModuleActive( state, siteId, 'stats' ) === false;
		return {
			isJetpack,
			siteId,
			slug: getSelectedSiteSlug( state ),
			planSlug: getSitePlanSlug( state, siteId ),
			showEnableStatsModule,
			path: getCurrentRouteParameterized( state, siteId ),
		};
	},
	{ recordGoogleEvent, enableJetpackStatsModule }
)( localize( StatsSite ) );
