import { Card, Button } from '@automattic/components';
import { localize, translate } from 'i18n-calypso';
import { find } from 'lodash';
import page from 'page';
import { parse as parseQs, stringify as stringifyQs } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import parselyIcon from 'calypso/assets/images/icons/parsely-logo.svg';
import JetpackBackupCredsBanner from 'calypso/blocks/jetpack-backup-creds-banner';
import PrivacyPolicyBanner from 'calypso/blocks/privacy-policy-banner';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections';
import QuerySiteKeyrings from 'calypso/components/data/query-site-keyrings';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import StickyPanel from 'calypso/components/sticky-panel';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { preventWidows } from 'calypso/lib/formatting';
import memoizeLast from 'calypso/lib/memoize-last';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import {
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ChartTabs from './stats-chart-tabs';
import Countries from './stats-countries';
import DatePicker from './stats-date-picker';
import StatsModule from './stats-module';
import StatsPeriodNavigation from './stats-period-navigation';
import statsStrings from './stats-strings';

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

const CHART_VIEWS = {
	attr: 'views',
	legendOptions: [ 'visitors' ],
	gridicon: 'visible',
	label: translate( 'Views', { context: 'noun' } ),
};
const CHART_VISITORS = {
	attr: 'visitors',
	gridicon: 'user',
	label: translate( 'Visitors', { context: 'noun' } ),
};
const CHART_LIKES = {
	attr: 'likes',
	gridicon: 'star',
	label: translate( 'Likes', { context: 'noun' } ),
};
const CHART_COMMENTS = {
	attr: 'comments',
	gridicon: 'comment',
	label: translate( 'Comments', { context: 'noun' } ),
};
const CHARTS = [ CHART_VIEWS, CHART_VISITORS, CHART_LIKES, CHART_COMMENTS ];

/**
 * Define chart properties with translatable strings getters
 */
Object.defineProperty( CHART_VIEWS, 'label', {
	get: () => translate( 'Views', { context: 'noun' } ),
} );
Object.defineProperty( CHART_VISITORS, 'label', {
	get: () => translate( 'Visitors', { context: 'noun' } ),
} );
Object.defineProperty( CHART_LIKES, 'label', {
	get: () => translate( 'Likes', { context: 'noun' } ),
} );
Object.defineProperty( CHART_COMMENTS, 'label', {
	get: () => translate( 'Comments', { context: 'noun' } ),
} );

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

	parselyClick = () => {
		this.props.recordTracksEvent( 'calypso_stats_parsely_banner_click' );
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
				<SidebarNavigation />
				<JetpackBackupCredsBanner event={ 'stats-backup-credentials' } />
				<FormattedHeader
					brandFont
					className="stats__section-header"
					headerText={ translate( 'Stats and Insights' ) }
					align="left"
					subHeaderText={ translate(
						"Learn more about the activity and behavior of your site's visitors. {{learnMoreLink}}Learn more{{/learnMoreLink}}.",
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="stats" showIcon={ false } />,
							},
						}
					) }
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
				<Card className="stats__parsely-banner">
					<TrackComponentView eventName="calypso_stats_parsely_banner_view" />
					<img src={ parselyIcon } alt="" aria-hidden="true" />
					<div>
						<FormattedHeader
							brandFont
							className="stats__parsely-banner-header"
							headerText={ preventWidows(
								translate( 'Discover more stats with Parse.ly Analytics' )
							) }
							align="left"
						/>
						<p>
							{ preventWidows(
								translate(
									"Need deeper insights? Parse.ly Analytics makes it easy to understand the full impact of your content. {{br/}}Measure what's driving awareness, engagement, and conversions.",
									{
										components: {
											br: <br />,
										},
									}
								)
							) }
						</p>
					</div>
					<Button
						primary
						href="https://www.parse.ly/wordpress-demo?utm_source=wpstats&utm_medium=jitm&utm_campaign=parselywpstatsdemo"
						onClick={ this.parselyClick }
						target="_blank"
					>
						{ translate( 'Learn more' ) }
					</Button>
				</Card>
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
			<Main wideLayout>
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
			showEnableStatsModule,
			path: getCurrentRouteParameterized( state, siteId ),
		};
	},
	{ recordGoogleEvent, enableJetpackStatsModule, recordTracksEvent }
)( localize( StatsSite ) );
