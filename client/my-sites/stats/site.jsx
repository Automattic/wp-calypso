import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { Icon, people, starEmpty, commentContent } from '@wordpress/icons';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import { find } from 'lodash';
import page from 'page';
import { parse as parseQs, stringify as stringifyQs } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import rocketImage from 'calypso/assets/images/customer-home/illustration--rocket.svg';
import illustration404 from 'calypso/assets/images/illustrations/illustration-404.svg';
import JetpackBackupCredsBanner from 'calypso/blocks/jetpack-backup-creds-banner';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import Banner from 'calypso/components/banner';
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
import { StatsNoContentBanner } from 'calypso/my-sites/stats/stats-no-content-banner';
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
	icon: (
		<svg className="gridicon" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="m4 13 .67.336.003-.005a2.42 2.42 0 0 1 .094-.17c.071-.122.18-.302.329-.52.298-.435.749-1.017 1.359-1.598C7.673 9.883 9.498 8.75 12 8.75s4.326 1.132 5.545 2.293c.61.581 1.061 1.163 1.36 1.599a8.29 8.29 0 0 1 .422.689l.002.005L20 13l.67-.336v-.003l-.003-.005-.008-.015-.028-.052a9.752 9.752 0 0 0-.489-.794 11.6 11.6 0 0 0-1.562-1.838C17.174 8.617 14.998 7.25 12 7.25S6.827 8.618 5.42 9.957c-.702.669-1.22 1.337-1.563 1.839a9.77 9.77 0 0 0-.516.845l-.008.015-.002.005-.001.002v.001L4 13Zm8 3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
				fill="#00101C"
			/>
		</svg>
	),
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

	renderPrivateSiteBanner( siteId, siteSlug ) {
		return (
			<Banner
				callToAction={ translate( 'Launch your site' ) }
				className="stats__private-site-banner"
				description={ translate(
					'Changing your site from private to public helps people find you and get more visitors. Don’t worry, you can keep working on your site.'
				) }
				disableCircle={ true }
				event="calypso_stats_private_site_banner"
				dismissPreferenceName={ `stats-launch-private-site-${ siteId }` }
				href={ `/settings/general/${ siteSlug }` }
				iconPath={ rocketImage }
				title={ translate( 'Launch your site to drive more visitors' ) }
				tracksClickName="calypso_stats_private_site_banner_click"
				tracksDismissName="calypso_stats_private_site_banner_dismiss"
				tracksImpressionName="calypso_stats_private_site_banner_view"
			/>
		);
	}

	renderStats() {
		const { date, siteId, slug, isJetpack, isSitePrivate, isOdysseyStats } = this.props;

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
		const pathTemplate = `${ traffic.path }/{{ interval }}${ slugPath }`;

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

						{ isSitePrivate ? this.renderPrivateSiteBanner( siteId, slug ) : null }
						{ ! isSitePrivate && <StatsNoContentBanner siteId={ siteId } siteSlug={ slug } /> }
					</>

					<div className="stats__module-list stats__module-list--traffic is-events stats__module--unified">
						{ config.isEnabled( 'newsletter/stats' ) && (
							<StatsModule
								path="emails-open"
								moduleStrings={ moduleStrings.emailsOpenStats }
								period={ this.props.period }
								query={ query }
								statType="statsEmailsOpen"
								hideSummaryLink
							/>
						) }
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
						{
							// File downloads are not yet supported in Jetpack Stats
							// TODO: Confirm the above statement.
							! isJetpack && (
								<StatsModule
									path="filedownloads"
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
