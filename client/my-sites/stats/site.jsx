import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { eye } from '@automattic/components/src/icons';
import { Icon, people, starEmpty, commentContent } from '@wordpress/icons';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import { find } from 'lodash';
import page from 'page';
import { parse as parseQs, stringify as stringifyQs } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import illustration404 from 'calypso/assets/images/illustrations/illustration-404.svg';
import JetpackBackupCredsBanner from 'calypso/blocks/jetpack-backup-creds-banner';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections';
import QuerySiteKeyrings from 'calypso/components/data/query-site-keyrings';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import memoizeLast from 'calypso/lib/memoize-last';
import {
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import HighlightsSection from './highlights-section';
import MiniCarousel from './mini-carousel';
import PromoCards from './promo-cards';
import ChartTabs from './stats-chart-tabs';
import Countries from './stats-countries';
import DatePicker from './stats-date-picker';
import StatsModule from './stats-module';
import StatsPeriodHeader from './stats-period-header';
import StatsPeriodNavigation from './stats-period-navigation';
import statsStrings from './stats-strings';

function getPageUrl() {
	return getUrlParts( page.current );
}

function updateQueryString( url = null, query = {} ) {
	let search = window.location.search;
	if ( url ) {
		search = url.search;
	}

	return {
		...parseQs( search.substring( 1 ) ),
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
	icon: <Icon className="gridicon" icon={ eye } />,
	label: translate( 'Views', { context: 'noun' } ),
};
const CHART_VISITORS = {
	attr: 'visitors',
	icon: <Icon className="gridicon" icon={ people } />,
	label: translate( 'Visitors', { context: 'noun' } ),
};
const CHART_LIKES = {
	attr: 'likes',
	icon: <Icon className="gridicon" icon={ starEmpty } />,
	label: translate( 'Likes', { context: 'noun' } ),
};
const CHART_COMMENTS = {
	attr: 'comments',
	icon: <Icon className="gridicon" icon={ commentContent } />,
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
		const parsed = getPageUrl();
		const updatedQs = stringifyQs( updateQueryString( parsed, { startDate: bar.data.period } ) );
		page.redirect( `${ parsed.pathname }?${ updatedQs }` );
	};

	onChangeLegend = ( activeLegend ) => this.setState( { activeLegend } );

	switchChart = ( tab ) => {
		if ( ! tab.loading && tab.attr !== this.props.chartTab ) {
			this.props.recordGoogleEvent( 'Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			// switch the tab by navigating to route with updated query string
			const updatedQs = stringifyQs( updateQueryString( getPageUrl(), { tab: tab.attr } ) );
			page.show( `${ getPageUrl().pathname }?${ updatedQs }` );
		}
	};

	renderStats() {
		const { date, siteId, slug, isJetpack, isSitePrivate, isOdysseyStats, context } = this.props;

		const queryDate = date.format( 'YYYY-MM-DD' );
		const { period, endOf } = this.props.period;
		const moduleStrings = statsStrings();

		const query = memoizedQuery( period, endOf );

		// For period option links
		const traffic = {
			label: translate( 'Traffic' ),
			path: '/stats',
		};
		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ traffic.path }/{{ interval }}${ slugPath }?tab=${
			this.state.activeTab ? this.state.activeTab.attr : 'views'
		}`;

		const wrapperClass = classNames( 'stats-content', {
			'is-period-year': period === 'year',
		} );

		return (
			<div className="stats">
				{ ! isOdysseyStats && (
					<div className="stats-banner-wrapper">
						<JetpackBackupCredsBanner event="stats-backup-credentials" />
					</div>
				) }

				<FormattedHeader
					brandFont
					className="stats__section-header modernized-header"
					headerText={ translate( 'Jetpack Stats' ) }
					align="left"
					subHeaderText={ translate(
						"Learn more about the activity and behavior of your site's visitors. {{learnMoreLink}}Learn more{{/learnMoreLink}}",
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink
										supportContext="stats"
										showIcon={ false }
										showSupportModal={ ! isOdysseyStats }
									/>
								),
							},
						}
					) }
				/>

				<StatsNavigation
					selectedItem="traffic"
					interval={ period }
					siteId={ siteId }
					slug={ slug }
				/>

				<HighlightsSection siteId={ siteId } />

				<div id="my-stats-content" className={ wrapperClass }>
					<>
						<StatsPeriodHeader>
							<StatsPeriodNavigation
								date={ date }
								period={ period }
								url={ `/stats/${ period }/${ slug }` }
								queryParams={ context.query }
							>
								<DatePicker
									period={ period }
									date={ date }
									query={ query }
									statsType="statsTopPosts"
									showQueryDate
									isShort
								/>
							</StatsPeriodNavigation>
							<Intervals selected={ period } pathTemplate={ pathTemplate } compact={ false } />
						</StatsPeriodHeader>

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
					</>

					<MiniCarousel
						isOdysseyStats={ isOdysseyStats }
						slug={ slug }
						isSitePrivate={ isSitePrivate }
					/>

					<div className="stats__module-list stats__module-list--traffic is-events stats__module--unified">
						<StatsModule
							path="posts"
							moduleStrings={ moduleStrings.posts }
							period={ this.props.period }
							query={ query }
							statType="statsTopPosts"
							showSummaryLink
						/>
						<StatsModule
							path="referrers"
							moduleStrings={ moduleStrings.referrers }
							period={ this.props.period }
							query={ query }
							statType="statsReferrers"
							showSummaryLink
						/>

						<Countries
							path="countries"
							period={ this.props.period }
							query={ query }
							summary={ false }
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
							path="searchterms"
							moduleStrings={ moduleStrings.search }
							period={ this.props.period }
							query={ query }
							statType="statsSearchTerms"
							showSummaryLink
						/>

						<StatsModule
							path="clicks"
							moduleStrings={ moduleStrings.clicks }
							period={ this.props.period }
							query={ query }
							statType="statsClicks"
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
						{ config.isEnabled( 'newsletter/stats' ) && (
							<>
								<StatsModule
									path="emails-open"
									moduleStrings={ moduleStrings.emailsOpenStats }
									period={ this.props.period }
									query={ query }
									statType="statsEmailsOpen"
									hideSummaryLink
									metricLabel={ translate( 'Opens' ) }
								/>
								<StatsModule
									path="emails-click"
									moduleStrings={ moduleStrings.emailsClickStats }
									period={ this.props.period }
									query={ query }
									statType="statsEmailsClick"
									hideSummaryLink
									metricLabel={ translate( 'Clicks' ) }
								/>
							</>
						) }
						{
							// File downloads are not yet supported in Jetpack Stats
							// TODO: Confirm the above statement.
							! isJetpack && (
								<StatsModule
									path="filedownloads"
									metricLabel={ translate( 'Downloads' ) }
									moduleStrings={ moduleStrings.filedownloads }
									period={ this.props.period }
									query={ query }
									statType="statsFileDownloads"
									showSummaryLink
									useShortLabel={ true }
								/>
							)
						}
					</div>
				</div>
				<PromoCards
					isJetpack={ isJetpack }
					isOdysseyStats={ isOdysseyStats }
					pageSlug="traffic"
					slug={ slug }
				/>
				<JetpackColophon />
			</div>
		);
	}

	enableStatsModule = () => {
		const { siteId, path } = this.props;
		this.props.enableJetpackStatsModule( siteId, path );
	};

	renderEnableStatsModule() {
		return (
			<EmptyContent
				illustration={ illustration404 }
				title={ translate( 'Looking for stats?' ) }
				line={ translate(
					'Enable Jetpack Stats to see detailed information about your traffic, likes, comments, and subscribers.'
				) }
				action={ translate( 'Enable Jetpack Stats' ) }
				actionCallback={ this.enableStatsModule }
			/>
		);
	}

	render() {
		const { isJetpack, siteId, showEnableStatsModule, isOdysseyStats } = this.props;
		const { period } = this.props.period;

		// Track the last viewed tab.
		// Necessary to properly configure the fixed navigation headers.
		sessionStorage.setItem( 'jp-stats-last-tab', 'traffic' );

		return (
			<Main fullWidthLayout>
				{ /* Odyssey: Google My Business pages are currently unsupported. */ }
				{ ! isOdysseyStats && (
					<>
						<QueryKeyringConnections />
						<QuerySiteKeyrings siteId={ siteId } />
					</>
				) }
				{ /* Odyssey: if Stats module is not enabled, the page will not be rendered. */ }
				{ ! isOdysseyStats && isJetpack && <QueryJetpackModules siteId={ siteId } /> }
				<DocumentHead title={ translate( 'Jetpack Stats' ) } />
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
		const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
		// Odyssey: if Stats is not enabled, the page will not be rendered.
		const showEnableStatsModule =
			! isOdysseyStats &&
			siteId &&
			isJetpack &&
			isJetpackModuleActive( state, siteId, 'stats' ) === false;
		return {
			isJetpack,
			isSitePrivate: isPrivateSite( state, siteId ),
			siteId,
			slug: getSelectedSiteSlug( state ),
			showEnableStatsModule,
			path: getCurrentRouteParameterized( state, siteId ),
			isOdysseyStats,
		};
	},
	{ recordGoogleEvent, enableJetpackStatsModule, recordTracksEvent }
)( localize( StatsSite ) );
