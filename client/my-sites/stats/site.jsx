import { localize, translate } from 'i18n-calypso';
import { find } from 'lodash';
import page from 'page';
import { parse as parseQs, stringify as stringifyQs } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import rocketImage from 'calypso/assets/images/customer-home/illustration--rocket.svg';
import wordpressSeoIllustration from 'calypso/assets/images/illustrations/wordpress-seo-premium.svg';
import JetpackBackupCredsBanner from 'calypso/blocks/jetpack-backup-creds-banner';
import PromoCardBlock from 'calypso/blocks/promo-card-block';
import StatsNavigation from 'calypso/blocks/stats-navigation';
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
import StickyPanel from 'calypso/components/sticky-panel';
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
		const { date, siteId, slug, isJetpack, isSitePrivate } = this.props;

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
				<JetpackBackupCredsBanner event="stats-backup-credentials" />
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
					selectedItem="traffic"
					interval={ period }
					siteId={ siteId }
					slug={ slug }
				/>

				{ isSitePrivate ? this.renderPrivateSiteBanner( siteId, slug ) : null }
				{ ! isSitePrivate && <StatsNoContentBanner siteId={ siteId } siteSlug={ slug } /> }

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
				<PromoCardBlock
					productSlug="wordpress-seo-premium"
					impressionEvent="calypso_stats_wordpress_seo_premium_banner_view"
					clickEvent="calypso_stats_wordpress_seo_premium_banner_click"
					headerText={ translate( 'Increase site visitors with Yoast SEO Premium' ) }
					contentText={ translate(
						'Purchase Yoast SEO Premium to ensure that more people find your incredible content.'
					) }
					ctaText={ translate( 'Learn more' ) }
					image={ wordpressSeoIllustration }
					href={ `/plugins/wordpress-seo-premium/${ slug }` }
				/>
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
				<QuerySiteKeyrings siteId={ siteId } />
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
			isSitePrivate: isPrivateSite( state, siteId ),
			siteId,
			slug: getSelectedSiteSlug( state ),
			showEnableStatsModule,
			path: getCurrentRouteParameterized( state, siteId ),
		};
	},
	{ recordGoogleEvent, enableJetpackStatsModule, recordTracksEvent }
)( localize( StatsSite ) );
