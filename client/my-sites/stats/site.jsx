import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { PAST_SEVEN_DAYS, PAST_THIRTY_DAYS } from '@automattic/components';
import { eye } from '@automattic/components/src/icons';
import { Icon, people, starEmpty, commentContent } from '@wordpress/icons';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import { find } from 'lodash';
import moment from 'moment';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import illustration404 from 'calypso/assets/images/illustrations/illustration-404.svg';
import JetpackBackupCredsBanner from 'calypso/blocks/jetpack-backup-creds-banner';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import { AVAILABLE_PAGE_MODULES, navItems } from 'calypso/blocks/stats-navigation/constants';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySiteKeyrings from 'calypso/components/data/query-site-keyrings';
import EmptyContent from 'calypso/components/empty-content';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import memoizeLast from 'calypso/lib/memoize-last';
import {
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getJetpackStatsAdminVersion, isJetpackSite } from 'calypso/state/sites/selectors';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { requestModuleSettings } from 'calypso/state/stats/module-settings/actions';
import { getModuleSettings } from 'calypso/state/stats/module-settings/selectors';
import { getModuleToggles } from 'calypso/state/stats/module-toggles/selectors';
import { getUpsellModalView } from 'calypso/state/stats/paid-stats-upsell/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import HighlightsSection from './highlights-section';
import MiniCarousel from './mini-carousel';
import PromoCards from './promo-cards';
import ChartTabs from './stats-chart-tabs';
import Countries from './stats-countries';
import DatePicker from './stats-date-picker';
import StatsModule from './stats-module';
import StatsModuleEmails from './stats-module-emails';
import StatsModuleUTM from './stats-module-utm';
import StatsNotices from './stats-notices';
import PageViewTracker from './stats-page-view-tracker';
import StatsPeriodHeader from './stats-period-header';
import StatsPeriodNavigation from './stats-period-navigation';
import StatsPlanUsage from './stats-plan-usage';
import statsStrings from './stats-strings';
import StatsUpsellModal from './stats-upsell-modal';
import { getPathWithUpdatedQueryString } from './utils';

// Sync hidable modules with StatsNavigation.
const HIDDABLE_MODULES = AVAILABLE_PAGE_MODULES.traffic.map( ( module ) => {
	return module.key;
} );

const memoizedQuery = memoizeLast( ( period, endOf ) => ( {
	period,
	date: endOf,
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
		customChartQuantity: null,
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
		page.redirect( getPathWithUpdatedQueryString( { startDate: bar.data.period } ) );
	};

	onChangeLegend = ( activeLegend ) => this.setState( { activeLegend } );

	switchChart = ( tab ) => {
		if ( ! tab.loading && tab.attr !== this.props.chartTab ) {
			this.props.recordGoogleEvent( 'Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			// switch the tab by navigating to route with updated query string
			page.show( getPathWithUpdatedQueryString( { tab: tab.attr } ) );
		}
	};

	isModuleHidden( moduleName ) {
		// Determine which modules are hidden.
		// @TODO: Rearrange the layout of modules to be more flexible with hidden blocks.
		if (
			HIDDABLE_MODULES.includes( moduleName ) &&
			this.props.moduleToggles[ moduleName ] === false
		) {
			return true;
		}
	}

	getValidDateOrNullFromInput( inputDate ) {
		if ( inputDate === undefined ) {
			return null;
		}
		const isValid = moment( inputDate ).isValid();
		return isValid ? inputDate : null;
	}

	// Return a default amount of days to subtracts from the present day depending on the period selected.
	// Used in case no starting date is present in the URL.
	getDefaultDaysForPeriod( period ) {
		switch ( period ) {
			case 'day':
				return 30;
			case 'week':
				return 12 * 7; // ~last 3 months
			case 'month':
				return 6 * 30; // ~last 6 months
			case 'year':
				return 5 * 365; // ~last 5 years
			default:
				return 30;
		}
	}

	renderStats() {
		const {
			date,
			siteId,
			slug,
			isAtomic,
			isJetpack,
			isSitePrivate,
			isOdysseyStats,
			context,
			moduleSettings,
			supportsPlanUsage,
			supportsEmailStats,
		} = this.props;

		let defaultPeriod = PAST_SEVEN_DAYS;

		const shouldShowUpsells = isOdysseyStats && ! isAtomic;

		// Set the current period based on the module settings.
		// @TODO: Introduce the loading state to avoid flickering due to slow module settings request.
		if ( moduleSettings?.highlights?.period_in_days === 30 ) {
			defaultPeriod = PAST_THIRTY_DAYS;
		}

		const queryDate = date.format( 'YYYY-MM-DD' );
		const { period, endOf } = this.props.period;
		const moduleStrings = statsStrings();

		// For the new date picker
		const isDateControlEnabled = config.isEnabled( 'stats/date-control' );

		// Set up a custom range for the chart.
		// Dependant on new date range picker controls.
		let customChartRange = null;
		let customChartQuantity;

		if ( isDateControlEnabled ) {
			// Sort out end date for chart.
			const chartEnd = this.getValidDateOrNullFromInput( context.query?.chartEnd );

			if ( chartEnd ) {
				customChartRange = { chartEnd };
			} else {
				customChartRange = { chartEnd: moment().format( 'YYYY-MM-DD' ) };
			}

			// Find the quantity of bars for the chart.
			let daysInRange = this.getDefaultDaysForPeriod( period );
			const chartStart = this.getValidDateOrNullFromInput( context.query?.chartStart );
			const isSameOrBefore = moment( chartStart ).isSameOrBefore( moment( chartEnd ) );

			if ( chartStart && isSameOrBefore ) {
				// Add one to calculation to include the start date.
				daysInRange = moment( chartEnd ).diff( moment( chartStart ), 'days' ) + 1;
				customChartRange.chartStart = chartStart;
			} else {
				// if start date is missing let the frequency of data take over to avoid showing one bar
				// (e.g. months defaulting to 30 days and showing one point)
				customChartRange.chartStart = moment()
					.subtract( daysInRange, 'days' )
					.format( 'YYYY-MM-DD' );
			}

			// Calculate diff between requested start and end in `priod` units.
			// Move end point (most recent) to the end of period to account for partial periods
			// (e.g. requesting period between June 2020 and Feb 2021 would require 2 `yearly` units but would return 1 unit without the shift to the end of period)
			const adjustedChartEndDate =
				period === 'day'
					? moment( customChartRange.chartEnd )
					: moment( customChartRange.chartEnd ).endOf( period );

			customChartQuantity = Math.ceil(
				adjustedChartEndDate.diff( moment( customChartRange.chartStart ), period, true )
			);

			customChartRange.daysInRange = daysInRange;
		}

		const query = memoizedQuery( period, endOf.format( 'YYYY-MM-DD' ) );

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

		const moduleListClasses = classNames(
			'is-events',
			'stats__module-list',
			'stats__module-list--traffic',
			'stats__module--unified',
			// @TODO: Refactor hidden modules with a more flexible layout (e.g., Flexbox) to fit mass configuration to moduels in the future.
			{
				'stats__module-list--traffic-no-authors': this.isModuleHidden( 'authors' ),
				'stats__module-list--traffic-no-videos': this.isModuleHidden( 'videos' ),
			},
			{
				'stats__flexible-grid-container': config.isEnabled( 'stats/flexible-grid' ),
			}
		);

		return (
			<div className="stats">
				{ ! isOdysseyStats && (
					<div className="stats-banner-wrapper">
						<JetpackBackupCredsBanner event="stats-backup-credentials" />
					</div>
				) }
				<NavigationHeader
					className="stats__section-header modernized-header"
					title={ translate( 'Jetpack Stats' ) }
					subtitle={ translate(
						"Gain insights into the activity and behavior of your site's visitors. {{learnMoreLink}}Learn more{{/learnMoreLink}}",
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="stats" showIcon={ false } />,
							},
						}
					) }
					screenReader={ navItems.traffic?.label }
					navigationItems={ [] }
				></NavigationHeader>
				<StatsNavigation
					selectedItem="traffic"
					interval={ period }
					siteId={ siteId }
					slug={ slug }
				/>
				<StatsNotices
					siteId={ siteId }
					isOdysseyStats={ isOdysseyStats }
					statsPurchaseSuccess={ context.query.statsPurchaseSuccess }
				/>
				<HighlightsSection siteId={ siteId } currentPeriod={ defaultPeriod } />
				<div id="my-stats-content" className={ wrapperClass }>
					<>
						<StatsPeriodHeader>
							<StatsPeriodNavigation
								date={ date }
								period={ period }
								url={ `/stats/${ period }/${ slug }` }
								queryParams={ context.query }
								pathTemplate={ pathTemplate }
								charts={ CHARTS }
								availableLegend={ this.getAvailableLegend() }
								activeTab={ getActiveTab( this.props.chartTab ) }
								activeLegend={ this.state.activeLegend }
								onChangeLegend={ this.onChangeLegend }
								isWithNewDateControl={ isDateControlEnabled }
								slug={ slug }
								dateRange={ customChartRange }
							>
								{ ' ' }
								<DatePicker
									period={ period }
									date={ date }
									query={ query }
									statsType="statsTopPosts"
									showQueryDate
									isShort
								/>
							</StatsPeriodNavigation>
							{ ! isDateControlEnabled && (
								<Intervals selected={ period } pathTemplate={ pathTemplate } compact={ false } />
							) }
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
							customQuantity={ customChartQuantity }
							customRange={ customChartRange }
							hideLegend={ isDateControlEnabled }
						/>
					</>

					{ ! isOdysseyStats && <MiniCarousel slug={ slug } isSitePrivate={ isSitePrivate } /> }

					<div className={ moduleListClasses }>
						<StatsModule
							path="posts"
							moduleStrings={ moduleStrings.posts }
							period={ this.props.period }
							query={ query }
							statType="statsTopPosts"
							showSummaryLink
							className={ classNames(
								'stats__flexible-grid-item--60',
								'stats__flexible-grid-item--full--large',
								'stats__flexible-grid-item--full--medium'
							) }
						/>
						<StatsModule
							path="referrers"
							moduleStrings={ moduleStrings.referrers }
							period={ this.props.period }
							query={ query }
							statType="statsReferrers"
							showSummaryLink
							className={ classNames(
								'stats__flexible-grid-item--40--once-space',
								'stats__flexible-grid-item--full--large',
								'stats__flexible-grid-item--full--medium'
							) }
						/>

						<Countries
							path="countries"
							period={ this.props.period }
							query={ query }
							summary={ false }
							className={ classNames( 'stats__flexible-grid-item--full' ) }
						/>

						{ ! this.isModuleHidden( 'authors' ) && (
							<StatsModule
								path="authors"
								moduleStrings={ moduleStrings.authors }
								period={ this.props.period }
								query={ query }
								statType="statsTopAuthors"
								className={ classNames(
									'stats__author-views',
									'stats__flexible-grid-item--one-third--two-spaces',
									'stats__flexible-grid-item--half--large',
									'stats__flexible-grid-item--full--medium'
								) }
								showSummaryLink
							/>
						) }

						<StatsModule
							path="searchterms"
							moduleStrings={ moduleStrings.search }
							period={ this.props.period }
							query={ query }
							statType="statsSearchTerms"
							showSummaryLink
							className={ classNames(
								{
									'stats__flexible-grid-item--one-third--two-spaces':
										! this.isModuleHidden( 'authors' ),
									'stats__flexible-grid-item--half--large': ! this.isModuleHidden( 'authors' ),
									'stats__flexible-grid-item--half': this.isModuleHidden( 'authors' ),
								},
								'stats__flexible-grid-item--full--medium'
							) }
						/>

						<StatsModule
							path="clicks"
							moduleStrings={ moduleStrings.clicks }
							period={ this.props.period }
							query={ query }
							statType="statsClicks"
							showSummaryLink
							className={ classNames(
								{
									'stats__flexible-grid-item--one-third--two-spaces':
										! this.isModuleHidden( 'authors' ),
									'stats__flexible-grid-item--half--large': ! this.isModuleHidden( 'authors' ),
									'stats__flexible-grid-item--half': this.isModuleHidden( 'authors' ),
								},
								'stats__flexible-grid-item--full--medium'
							) }
						/>
						{ ! this.isModuleHidden( 'videos' ) && (
							<StatsModule
								path="videoplays"
								moduleStrings={ moduleStrings.videoplays }
								period={ this.props.period }
								query={ query }
								statType="statsVideoPlays"
								showSummaryLink
								className={ classNames(
									'stats__flexible-grid-item--half',
									'stats__flexible-grid-item--full--medium'
								) }
							/>
						) }
						{ supportsEmailStats && (
							<StatsModuleEmails
								period={ this.props.period }
								query={ query }
								className={ classNames(
									{
										'stats__flexible-grid-item--half': ! this.isModuleHidden( 'videos' ),
										'stats__flexible-grid-item--full': this.isModuleHidden( 'videos' ),
									},
									'stats__flexible-grid-item--full--large',
									'stats__flexible-grid-item--full--medium'
								) }
							/>
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
									className={ classNames(
										'stats__flexible-grid-item--half',
										'stats__flexible-grid-item--full--large'
									) }
								/>
							)
						}
					</div>

					{
						// TODO: Move this under the Countries module.
						// - Will require some reworking of the CSS to work correctly though.
						// - Because of the visibility toggles for Authors and Videos, we require multiple
						// copies of the Grid CSS.
						// - May have to move from grid to flexbox.
					 }
					{ config.isEnabled( 'stats/utm-module' ) && (
						<StatsModuleUTM siteId={ siteId } period={ this.props.period } query={ query } />
					) }
				</div>
				{ supportsPlanUsage && (
					<StatsPlanUsage siteId={ siteId } isOdysseyStats={ isOdysseyStats } />
				) }
				{ /* Only load Jetpack Upsell Section for Odyssey Stats excluding Atomic */ }
				{ ! shouldShowUpsells ? null : (
					<AsyncLoad require="calypso/my-sites/stats/jetpack-upsell-section" />
				) }
				<PromoCards isOdysseyStats={ isOdysseyStats } pageSlug="traffic" slug={ slug } />
				<JetpackColophon />
				<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
				{ this.props.upsellModalView && <StatsUpsellModal siteId={ siteId } /> }
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
				line={
					<p>
						{ translate(
							'Enable Jetpack Stats to see detailed information about your traffic, likes, comments, and subscribers.'
						) }
					</p>
				}
				action={ translate( 'Enable Jetpack Stats' ) }
				actionCallback={ this.enableStatsModule }
			/>
		);
	}

	componentDidMount() {
		// TODO: Migrate to a query component pattern (i.e. <QueryStatsModuleSettings siteId={siteId} />).
		this.props.requestModuleSettings( this.props.siteId );
	}

	renderInsufficientPermissionsPage() {
		return (
			<EmptyContent
				illustration={ illustration404 }
				title={ translate( 'Looking for stats?' ) }
				line={
					<p>
						<div>
							{ translate( "We're sorry, but you do not have permission to access this page." ) }
						</div>
						<div>{ translate( "Please contact your site's administrator for access." ) }</div>
					</p>
				}
			/>
		);
	}

	renderBody() {
		if ( ! this.props.canUserViewStats ) {
			return this.renderInsufficientPermissionsPage();
		} else if ( this.props.showEnableStatsModule ) {
			return this.renderEnableStatsModule();
		}

		return this.renderStats();
	}

	render() {
		const { isJetpack, siteId, isOdysseyStats } = this.props;
		const { period } = this.props.period;

		// Track the last viewed tab.
		// Necessary to properly configure the fixed navigation headers.
		sessionStorage.setItem( 'jp-stats-last-tab', 'traffic' );

		return (
			<Main fullWidthLayout ariaLabel={ translate( 'Jetpack Stats' ) }>
				{ config.isEnabled( 'stats/paid-wpcom-v2' ) && ! isOdysseyStats && (
					<QuerySiteFeatures siteIds={ [ siteId ] } />
				) }
				{ /* Odyssey: Google Business Profile pages are currently unsupported. */ }
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
				{ this.renderBody() }
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
		const canUserManageOptions = canCurrentUser( state, siteId, 'manage_options' );
		const isJetpack = isJetpackSite( state, siteId );
		const statsAdminVersion = getJetpackStatsAdminVersion( state, siteId );
		const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

		// Odyssey Stats: This UX is not possible in Odyssey as this page would not be able to render in the first place.
		const showEnableStatsModule =
			! isOdysseyStats &&
			siteId &&
			isJetpack &&
			isJetpackModuleActive( state, siteId, 'stats' ) === false &&
			canUserManageOptions;

		// Odyssey Stats: Access control is done in PHP, so skip capability check here.
		// TODO: Fix incorrect view_stats permission on Calypso.
		//       If the user's role is missing from the site's stats dashboard access allowlist (fetched via getJetpackSettings.role),
		//       then it should be reflected in the user's view_stats capability.
		const canUserViewStats =
			isOdysseyStats || canUserManageOptions || canCurrentUser( state, siteId, 'view_stats' );

		const slug = getSelectedSiteSlug( state );
		const upsellModalView =
			config.isEnabled( 'stats/paid-wpcom-v2' ) && getUpsellModalView( state, siteId );
		const { supportsPlanUsage, supportsEmailStats } = getEnvStatsFeatureSupportChecks(
			state,
			siteId
		);

		return {
			canUserViewStats,
			isAtomic: isAtomicSite( state, siteId ),
			isJetpack,
			isSitePrivate: isPrivateSite( state, siteId ),
			siteId,
			slug,
			showEnableStatsModule,
			path: getCurrentRouteParameterized( state, siteId ),
			isOdysseyStats,
			moduleSettings: getModuleSettings( state, siteId, 'traffic' ),
			moduleToggles: getModuleToggles( state, siteId, 'traffic' ),
			upsellModalView,
			statsAdminVersion,
			supportsEmailStats,
			supportsPlanUsage,
		};
	},
	{
		recordGoogleEvent,
		enableJetpackStatsModule,
		recordTracksEvent,
		requestModuleSettings,
	}
)( localize( StatsSite ) );
