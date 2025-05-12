import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { eye } from '@automattic/components/src/icons';
import { Icon, people, starEmpty, commentContent, settings } from '@wordpress/icons';
import clsx from 'clsx';
import { localize, translate } from 'i18n-calypso';
import { find } from 'lodash';
import moment from 'moment';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import titlecase from 'to-title-case';
import illustration404 from 'calypso/assets/images/illustrations/illustration-404.svg';
import JetpackBackupCredsBanner from 'calypso/blocks/jetpack-backup-creds-banner';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import { AVAILABLE_PAGE_MODULES, navItems } from 'calypso/blocks/stats-navigation/constants';
import PageModuleToggler, {
	getAvailablePageModules,
} from 'calypso/blocks/stats-navigation/page-module-toggler';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections';
import QuerySiteKeyrings from 'calypso/components/data/query-site-keyrings';
import { useShortcuts } from 'calypso/components/date-range/use-shortcuts';
import EmptyContent from 'calypso/components/empty-content';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import NavigationHeader from 'calypso/components/navigation-header';
import StickyPanel from 'calypso/components/sticky-panel';
import version_compare from 'calypso/lib/version-compare';
import Main from 'calypso/my-sites/stats/components/stats-main';
import {
	DATE_FORMAT,
	STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
	STATS_FEATURE_PAGE_TRAFFIC,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_PRODUCT_NAME,
} from 'calypso/my-sites/stats/constants';
import { getMomentSiteZone } from 'calypso/my-sites/stats/hooks/use-moment-site-zone';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { getChartRangeParams } from 'calypso/my-sites/stats/utils';
import {
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import hasLoadedSiteFeatures from 'calypso/state/selectors/has-loaded-site-features';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite, getJetpackStatsAdminVersion } from 'calypso/state/sites/selectors';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { getModuleToggles } from 'calypso/state/stats/module-toggles/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PageHeader from './components/headers/page-header';
import StatsModuleAuthors from './features/modules/stats-authors';
import StatsModuleClicks from './features/modules/stats-clicks';
import StatsModuleCountries from './features/modules/stats-countries';
import StatsModuleDevices, {
	StatsModuleUpgradeDevicesOverlay,
} from './features/modules/stats-devices';
import StatsModuleDownloads from './features/modules/stats-downloads';
import StatsModuleLocations from './features/modules/stats-locations';
import StatsModuleReferrers from './features/modules/stats-referrers';
import StatsModuleSearch from './features/modules/stats-search';
import StatsModuleTopPosts from './features/modules/stats-top-posts';
import StatsModuleUTM, { StatsModuleUTMOverlay } from './features/modules/stats-utm';
import StatsModuleVideos from './features/modules/stats-videos';
import StatsFeedbackPresentor from './feedback';
import { shouldGateStats } from './hooks/use-should-gate-stats';
import MiniCarousel from './mini-carousel';
import { StatsGlobalValuesContext } from './pages/providers/global-provider';
import StatsModuleListing from './pages/shared/stats-module-listing';
import PromoCards from './promo-cards';
import StatsCardUpdateJetpackVersion from './stats-card-upsell/stats-card-update-jetpack-version';
import ChartTabs from './stats-chart-tabs';
import DatePicker from './stats-date-picker';
import StatsNotices from './stats-notices';
import PageViewTracker from './stats-page-view-tracker';
import StatsPeriodHeader from './stats-period-header';
import StatsPeriodNavigation from './stats-period-navigation';
import StatsPlanUsage from './stats-plan-usage';
import statsStrings from './stats-strings';
import StatsUpsell from './stats-upsell/traffic-upsell';
import { appendQueryStringForRedirection, getPathWithUpdatedQueryString } from './utils';

// Sync hidable modules with StatsNavigation.
const HIDDABLE_MODULES = AVAILABLE_PAGE_MODULES.traffic.map( ( module ) => {
	return module.key;
} );

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

// Return a default amount of days to subtracts from the present day depending on the period selected.
// Used in case no starting date is present in the URL.
const getDefaultDaysForPeriod = ( period ) => {
	switch ( period ) {
		case 'hour':
			return 1;
		case 'day':
			return 7;
		case 'week':
			return 12 * 7; // ~last 3 months
		case 'month':
			return 6 * 30; // ~last 6 months
		case 'year':
			return 5 * 365; // ~last 5 years
		default:
			return 30;
	}
};

function moduleVisibilityWithUserConfiguration( userConfig, hasVideoPress ) {
	const defaults = {};
	const modules = getAvailablePageModules( 'traffic', hasVideoPress );
	modules.forEach( ( module ) => {
		defaults[ module.key ] = module.defaultValue;
	} );

	return { ...defaults, ...userConfig };
}

function StatsBody( { siteId, chartTab = 'views', date, context, isInternal, ...props } ) {
	const dispatch = useDispatch();
	const { period } = props.period;
	const [ activeTabState, setActiveTabState ] = useState( () => getActiveTab( chartTab ) );
	const [ activeLegend, setActiveLegend ] = useState( () =>
		period !== 'hour' ? getActiveTab( chartTab ).legendOptions || [] : []
	);
	const queryDate = date.format( DATE_FORMAT );

	const moduleStrings = statsStrings();

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const isWPAdmin = config.isEnabled( 'is_odyssey' );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const isSitePrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );
	const isStatsNavigationImprovementEnabled = config.isEnabled( 'stats/navigation-improvement' );
	const slug = useSelector( getSelectedSiteSlug );
	const moduleToggles = useSelector( ( state ) => getModuleToggles( state, siteId, 'traffic' ) );
	const momentSiteZone = useSelector( ( state ) => getMomentSiteZone( state, siteId ) );
	const hasVideoPress = useSelector( ( state ) => siteHasFeature( state, siteId, 'videopress' ) );
	const [ isPageSettingsTooltipDismissed, setIsPageSettingsTooltipDismissed ] = useState(
		!! localStorage.getItem( 'notices_dismissed__traffic_page_settings' )
	);

	// Determine module visibility based on user settings, VideoPress availability, AND defaults.
	const moduleVisibility = useMemo(
		() => moduleVisibilityWithUserConfiguration( moduleToggles, hasVideoPress ),
		[ hasVideoPress, moduleToggles ]
	);

	const {
		supportsPlanUsage,
		supportsUTMStats: supportsUTMStatsFeature,
		supportsDevicesStats: supportsDevicesStatsFeature,
		isOldJetpack,
		supportUserFeedback,
	} = useSelector( ( state ) => getEnvStatsFeatureSupportChecks( state, siteId ) );

	// Find the applied shortcut with shortcut ID from the URL.
	const shortcuts = useShortcuts( {
		chartStart: context.query?.chartStart,
		chartEnd: context.query?.chartEnd,
		shortcutId: context.query?.shortcut,
	} );
	const { supportedShortcutList } = shortcuts;
	let storedShortcut = useMemo( () => {
		const storedShortcutId =
			localStorage.getItem( `jetpack_stats_stored_date_range_shortcut_id_${ siteId }` ) ||
			// Fallback for the compatibility.
			localStorage.getItem( 'jetpack_stats_stored_date_range_shortcut_id' );

		return supportedShortcutList.find( ( shortcut ) => shortcut.id === storedShortcutId ) || null;
	}, [ siteId, supportedShortcutList ] );
	let { selectedShortcut: appliedShortcut } = shortcuts;

	const hasSiteLoadedFeatures = useSelector(
		( state ) => isWPAdmin || hasLoadedSiteFeatures( state, siteId )
	);
	// TODO: We may need a detailed hierarchy of the shortcut gates.
	const shouldForceDefaultDateRange =
		useSelector( ( state ) =>
			shouldGateStats( state, siteId, STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS )
		) && hasSiteLoadedFeatures;

	const shouldForceDefaultPeriod =
		useSelector( ( state ) =>
			shouldGateStats( state, siteId, STATS_FEATURE_INTERVAL_DROPDOWN_WEEK )
		) && hasSiteLoadedFeatures;

	// Remove appliedShortcut and storedShortcut if the date range or chart perod is locked.
	if ( shouldForceDefaultDateRange || shouldForceDefaultPeriod ) {
		appliedShortcut = null;
		storedShortcut = null;
	}

	const wpcomShowUpsell = useSelector(
		( state ) =>
			config.isEnabled( 'stats/paid-wpcom-v3' ) &&
			shouldGateStats( state, siteId, STATS_FEATURE_PAGE_TRAFFIC )
	);

	const shouldShowUpsells = isOdysseyStats && ! isAtomic;
	const supportsUTMStats = supportsUTMStatsFeature || isInternal;
	const supportsDevicesStats = supportsDevicesStatsFeature || isInternal;
	const getAvailableLegend = () => {
		const activeTab = getActiveTab( chartTab );
		// TODO: remove this when we support hourly visitors.
		return period !== 'hour' ? activeTab.legendOptions || [] : [];
	};

	const navigationFromChartBar = ( periodStartDate, currentPeriod ) => {
		// Mark the drilled-down period page should use the go-back action.
		sessionStorage.setItem( 'jetpack_stats_date_range_is_drilling_down', 1 );

		const chartRangeParams = getChartRangeParams( periodStartDate, currentPeriod );

		let { chartStart, chartEnd } = chartRangeParams;
		// Limit navigation within the currently selected range.
		const currentChartStart = context.query?.chartStart;
		const currentChartEnd = context.query?.chartEnd;
		if ( currentChartStart && moment( chartStart ).isBefore( currentChartStart ) ) {
			chartStart = currentChartStart;
		}
		if ( currentChartEnd && moment( chartEnd ).isAfter( currentChartEnd ) ) {
			chartEnd = currentChartEnd;
		}

		const path = `/stats/${ chartRangeParams.chartPeriod }/${ slug }`;
		const url = getPathWithUpdatedQueryString( { chartStart, chartEnd }, path );

		return url;
	};

	const barClick = ( bar ) => {
		dispatch( recordGoogleEvent( 'Stats', 'Clicked Chart Bar' ) );

		const { period: barPeriod } = props.period;
		// Stop navigation if the bar period is hour.
		// Stop navigation if date control is locked to prevent navigation to hourly stats.
		// TODO: Determine if we should allow navigation to hourly stats when STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS is locked.
		if ( barPeriod === 'hour' || shouldForceDefaultDateRange ) {
			return;
		}

		// Navigate from the chart bar with period and period start date.
		page( navigationFromChartBar( bar.data.period, barPeriod ) );
	};

	const onChangeLegend = useCallback(
		( newLegend ) => setActiveLegend( newLegend ),
		[ setActiveLegend ]
	);

	const switchChart = useCallback(
		( tab ) => {
			if ( ! tab.loading && tab.attr !== chartTab ) {
				dispatch( recordGoogleEvent( 'Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' ) );
				// switch the tab by navigating to route with updated query string
				page.redirect( getPathWithUpdatedQueryString( { tab: tab.attr } ) );
			}
		},
		[ chartTab, dispatch ]
	);

	const isModuleHidden = ( moduleName ) => {
		// Determine which modules are hidden.
		// @TODO: Rearrange the layout of modules to be more flexible with hidden blocks.
		if ( HIDDABLE_MODULES.includes( moduleName ) && moduleVisibility[ moduleName ] === false ) {
			return true;
		}
	};

	const getValidDateOrNullFromInput = useCallback(
		( inputDate, inputKey ) => {
			// Use the stored chartStart and chartEnd if they are valid when the inputDate is absent.
			if ( inputDate === undefined ) {
				if ( storedShortcut ) {
					const storedValue = storedShortcut[ inputKey ];
					const isStoredValueValid = moment( storedValue ).isValid();

					return isStoredValueValid ? storedValue : null;
				}
			}

			const isValid = moment( inputDate ).isValid();

			return isValid ? inputDate : null;
		},
		[ storedShortcut ]
	);

	// Note: This is only used in the empty version of the module.
	// There's a similar function inside stats-module/index.jsx that is used when we have content.
	const getStatHref = ( modulePath, query ) => {
		const paramsValid = props.period && modulePath && slug;
		if ( ! paramsValid ) {
			return undefined;
		}

		let url = `/stats/${ props.period.period }/${ modulePath }/${ slug }`;

		if ( query?.start_date ) {
			url += `?startDate=${ query.start_date }&endDate=${ query.date }`;
		} else {
			url += `?startDate=${ props.period.endOf.format( DATE_FORMAT ) }`;
		}

		return url;
	};

	// Set up a custom range for the chart.
	// Dependant on new date range picker controls.
	const customChartRange = {};

	// Sort out end date for chart.
	let chartEnd = useMemo( () => {
		return getValidDateOrNullFromInput( context.query?.chartEnd, 'endDate' );
	}, [ context.query?.chartEnd, getValidDateOrNullFromInput ] );

	let chartStart = useMemo( () => {
		return getValidDateOrNullFromInput( context.query?.chartStart, 'startDate' );
	}, [ context.query?.chartStart, getValidDateOrNullFromInput ] );

	// Respect the shortcut ID from the URL if it's valid.
	if ( appliedShortcut ) {
		customChartRange.shortcutId = appliedShortcut.id;
		chartEnd = appliedShortcut.endDate;
		chartStart = appliedShortcut.startDate;
	}

	if ( chartEnd ) {
		customChartRange.chartEnd = chartEnd;
	} else {
		customChartRange.chartEnd = momentSiteZone.format( DATE_FORMAT );
	}

	const isSameOrBefore = moment( chartStart ).isSameOrBefore( moment( chartEnd ) );
	// Find the quantity of bars for the chart.
	let daysInRange = getDefaultDaysForPeriod( period );
	if ( chartStart && isSameOrBefore ) {
		// Add one to calculation to include the start date.
		daysInRange = moment( chartEnd ).diff( moment( chartStart ), 'days' ) + 1;
		customChartRange.chartStart = chartStart;
	} else {
		// if start date is missing let the frequency of data take over to avoid showing one bar
		// (e.g. months defaulting to 30 days and showing one point)
		customChartRange.chartStart = momentSiteZone
			.clone()
			.subtract( daysInRange - 1, 'days' )
			.format( DATE_FORMAT );
	}
	customChartRange.daysInRange = daysInRange;

	// Apply the stored shortcut ID if the date range is not set.
	if ( ! context.query?.chartStart && ! context.query?.chartEnd && storedShortcut ) {
		customChartRange.shortcutId = storedShortcut.id;
	}

	// Calculate diff between requested start and end in `priod` units.
	// Move end point (most recent) to the end of period to account for partial periods
	// (e.g. requesting period between June 2020 and Feb 2021 would require 2 `yearly` units but would return 1 unit without the shift to the end of period)
	// TODO: We need to align the start day of week from the backend.
	let momentPeriod = period;
	if ( momentPeriod === 'week' ) {
		momentPeriod = 'isoWeek';
	} else if ( momentPeriod === 'hour' ) {
		momentPeriod = 'day';
	}
	const adjustedChartStartDate = moment( customChartRange.chartStart ).startOf( momentPeriod );
	const adjustedChartEndDate = moment( customChartRange.chartEnd ).endOf( momentPeriod );

	let customChartQuantity = Math.ceil(
		adjustedChartEndDate.diff( adjustedChartStartDate, period, true )
	);

	// Force the default date range to be 7 days if the 30-day option is locked.
	if ( shouldForceDefaultDateRange && period !== 'hour' ) {
		// For ChartTabs
		customChartQuantity = 7;

		// For StatsDateControl
		customChartRange.daysInRange = 7;
		customChartRange.chartEnd = momentSiteZone.format( DATE_FORMAT );
		customChartRange.chartStart = moment( customChartRange.chartEnd )
			.subtract( customChartRange.daysInRange - 1, 'days' )
			.format( DATE_FORMAT );
	}

	// Redirect with the shortcut period of appliedShortcut or storedShortcut.
	useEffect(
		() => {
			if ( appliedShortcut?.period ) {
				if ( appliedShortcut?.period !== period ) {
					page.redirect(
						appendQueryStringForRedirection(
							`/stats/${ appliedShortcut?.period }/${ slug }`,
							context.query
						)
					);
					return;
				}
			} else if (
				! context.query?.chartStart &&
				! context.query?.chartEnd &&
				storedShortcut?.period &&
				storedShortcut?.period !== period
			) {
				page.redirect(
					appendQueryStringForRedirection(
						`/stats/${ storedShortcut?.period }/${ slug }`,
						context.query
					)
				);
				return;
			}
		},
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
		[
			// Do not include the period from URL segments in the dependency array to prevent period selection invalidation.
			slug,
			appliedShortcut?.period,
			context.query?.chartStart,
			context.query?.chartEnd,
			storedShortcut?.period,
		]
	);

	// Redirect to the corresponding period by gates and date range.
	useEffect( () => {
		// Redirect to the daily views if the period dropdown is locked.
		if ( shouldForceDefaultPeriod && period !== 'day' ) {
			page.redirect( appendQueryStringForRedirection( `/stats/day/${ slug }`, context.query ) );
			return;
		}

		// TODO: all the date logic should be done in controllers, otherwise it affects the performance.
		// If it's single day period, redirect to hourly stats.
		if ( ! shouldForceDefaultPeriod && period === 'day' && daysInRange === 1 ) {
			page.redirect( appendQueryStringForRedirection( `/stats/hour/${ slug }`, context.query ) );
			return;
		}
	}, [ shouldForceDefaultPeriod, period, daysInRange, slug, context.query ] );

	// setActiveTabState and setActiveLegend
	useEffect( () => {
		const newActiveTab = getActiveTab( chartTab );
		setActiveTabState( newActiveTab );
		setActiveLegend( period !== 'hour' ? newActiveTab.legendOptions || [] : [] );
	}, [ chartTab, period, activeTabState, context.query ] );

	const query = useMemo(
		() => ( {
			period: 'day',
			start_date: customChartRange.chartStart,
			date: customChartRange.chartEnd,
			summarize: 1,
			max: 10,
		} ),
		[ customChartRange.chartStart, customChartRange.chartEnd ]
	);

	// For period option links
	const traffic = {
		label: translate( 'Traffic' ),
		path: '/stats',
	};
	const slugPath = slug ? `/${ slug }` : '';
	const pathTemplate = `${ traffic.path }/{{ interval }}${ slugPath }?tab=${
		activeTabState ? activeTabState.attr : 'views'
	}`;

	const wrapperClass = clsx( 'stats-content', {
		'is-period-year': period === 'year',
	} );

	const moduleListClassNames = clsx( 'is-events', 'stats__module-list--traffic' );

	const halfWidthModuleClasses = clsx(
		'stats__flexible-grid-item--half',
		'stats__flexible-grid-item--full--large',
		'stats__flexible-grid-item--full--medium'
	);

	// TODO: Fix isOdysseyStats to include the environment running on WP-Admin of Simple sites.
	const isRunningOnWPAdmin = document.getElementById( 'wpadminbar' );

	const statsAdminVersion = useSelector( ( state ) =>
		getJetpackStatsAdminVersion( state, siteId )
	);

	const { data: showSettingsTooltip, refetch: refetchNotices } = useNoticeVisibilityQuery(
		siteId,
		'traffic_page_settings'
	);
	const { mutateAsync: mutateNoticeVisbilityAsync } = useNoticeVisibilityMutation(
		siteId,
		'traffic_page_settings'
	);

	const onTooltipDismiss = () => {
		if ( isPageSettingsTooltipDismissed || ! showSettingsTooltip ) {
			return;
		}

		setIsPageSettingsTooltipDismissed( true );
		localStorage.setItem( 'notices_dismissed__traffic_page_settings', 1 );
		mutateNoticeVisbilityAsync().finally( refetchNotices );
	};

	// Module settings for Odyssey are not supported until stats-admin@0.9.0-alpha.
	const isModuleSettingsSupported =
		! config.isEnabled( 'is_running_in_jetpack_site' ) ||
		!! ( statsAdminVersion && version_compare( statsAdminVersion, '0.9.0-alpha', '>=' ) );

	const shouldRenderModuleToggler =
		isModuleSettingsSupported && AVAILABLE_PAGE_MODULES.traffic && ! wpcomShowUpsell;

	return (
		<div className="stats">
			{ ! isOdysseyStats && (
				<div className="stats-banner-wrapper">
					<JetpackBackupCredsBanner event="stats-backup-credentials" />
				</div>
			) }
			{ isStatsNavigationImprovementEnabled ? (
				<PageHeader
					rightSection={
						shouldRenderModuleToggler && (
							<PageModuleToggler
								selectedItem="traffic"
								moduleToggles={ moduleToggles }
								siteId={ siteId }
								isTooltipShown={ showSettingsTooltip && ! isPageSettingsTooltipDismissed }
								onTooltipDismiss={ onTooltipDismiss }
								customToggleIcon={ <Icon className="gridicon" icon={ settings } /> }
							/>
						)
					}
				/>
			) : (
				<NavigationHeader
					className="stats__section-header modernized-header"
					title={ STATS_PRODUCT_NAME }
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
				/>
			) }
			<StatsNavigation selectedItem="traffic" interval={ period } siteId={ siteId } slug={ slug } />
			<StatsNotices
				siteId={ siteId }
				isOdysseyStats={ isOdysseyStats }
				statsPurchaseSuccess={ context.query.statsPurchaseSuccess }
			/>
			<StickyPanel headerId={ isRunningOnWPAdmin ? 'wpadminbar' : 'header' }>
				<StatsPeriodHeader>
					<StatsPeriodNavigation
						date={ date }
						period={ period }
						url={ `/stats/${ period }/${ slug }` }
						queryParams={ context.query }
						pathTemplate={ pathTemplate }
						charts={ CHARTS }
						availableLegend={ getAvailableLegend() }
						activeTab={ getActiveTab( chartTab ) }
						activeLegend={ activeLegend }
						onChangeLegend={ onChangeLegend }
						isWithNewDateControl
						showArrows={ ! wpcomShowUpsell }
						slug={ slug }
						dateRange={ customChartRange }
					>
						{ ' ' }
						<DatePicker
							period={ period }
							date={ date }
							query={ query }
							queryParams={ context.query }
							statsType="statsTopPosts"
							showQueryDate
							isShort
							dateRange={ customChartRange }
						/>
					</StatsPeriodNavigation>
				</StatsPeriodHeader>
			</StickyPanel>
			<div id="my-stats-content" className={ wrapperClass }>
				<ChartTabs
					slug={ slug }
					period={ props.period }
					queryParams={ context.query }
					activeTab={ getActiveTab( chartTab ) }
					activeLegend={ activeLegend }
					availableLegend={ getAvailableLegend() }
					onChangeLegend={ onChangeLegend }
					// TODO: test default date range
					barClick={ barClick }
					className="is-date-filtering-enabled"
					switchTab={ switchChart }
					charts={ CHARTS }
					queryDate={ queryDate }
					chartTab={ chartTab }
					customQuantity={ customChartQuantity }
					customRange={ customChartRange }
				/>

				{ ! wpcomShowUpsell && (
					<>
						{ ! isOdysseyStats && <MiniCarousel slug={ slug } isSitePrivate={ isSitePrivate } /> }

						<StatsModuleListing className={ moduleListClassNames } siteId={ siteId }>
							<StatsModuleTopPosts
								moduleStrings={ moduleStrings.posts }
								period={ props.period }
								query={ query }
								summaryUrl={ getStatHref( 'posts', query ) }
								className={ halfWidthModuleClasses }
							/>
							<StatsModuleReferrers
								moduleStrings={ moduleStrings.referrers }
								period={ props.period }
								query={ query }
								summaryUrl={ getStatHref( 'referrers', query ) }
								className={ halfWidthModuleClasses }
							/>

							{ config.isEnabled( 'stats/locations' ) ? (
								<>
									<StatsModuleLocations
										moduleStrings={ moduleStrings.locations }
										period={ props.period }
										query={ query }
										summaryUrl={ getStatHref( 'locations', query ) }
										className={ clsx( 'stats__flexible-grid-item--full' ) }
										context={ context }
										summary={ false }
									/>
								</>
							) : (
								<StatsModuleCountries
									moduleStrings={ moduleStrings.countries }
									period={ props.period }
									query={ query }
									summaryUrl={ getStatHref( 'countryviews', query ) }
									className={ clsx( 'stats__flexible-grid-item--full' ) }
								/>
							) }

							{ /* If UTM if supported display the module or update Jetpack plugin card */ }
							{ supportsUTMStats && ! isOldJetpack && (
								<StatsModuleUTM
									siteId={ siteId }
									period={ props.period }
									query={ query }
									summaryUrl={ getStatHref( 'utm', query ) }
									summary={ false }
									className={ halfWidthModuleClasses }
									context={ context }
								/>
							) }

							{ supportsUTMStats && isOldJetpack && (
								<StatsModuleUTMOverlay
									siteId={ siteId }
									className={ halfWidthModuleClasses }
									overlay={
										<StatsCardUpdateJetpackVersion
											className="stats-module__upsell stats-module__upgrade"
											siteId={ siteId }
											statType="utm"
										/>
									}
								/>
							) }

							<StatsModuleClicks
								moduleStrings={ moduleStrings.clicks }
								period={ props.period }
								query={ query }
								summaryUrl={ getStatHref( 'clicks', query ) }
								className={ halfWidthModuleClasses }
							/>

							{ ! isModuleHidden( 'authors' ) && (
								<StatsModuleAuthors
									moduleStrings={ moduleStrings.authors }
									period={ props.period }
									query={ query }
									summaryUrl={ getStatHref( 'authors', query ) }
									className={ halfWidthModuleClasses }
								/>
							) }

							{ ! isModuleHidden( 'search-terms' ) && (
								<StatsModuleSearch
									moduleStrings={ moduleStrings.search }
									period={ props.period }
									query={ query }
									summaryUrl={ getStatHref( 'searchterms', query ) }
									className={ halfWidthModuleClasses }
								/>
							) }

							{ ! isModuleHidden( 'videos' ) && (
								<StatsModuleVideos
									moduleStrings={ moduleStrings.videoplays }
									period={ props.period }
									query={ query }
									summaryUrl={ getStatHref( 'videoplays', query ) }
									className={ halfWidthModuleClasses }
								/>
							) }

							{
								// File downloads are not yet supported in Jetpack environment
								! isJetpack && (
									<StatsModuleDownloads
										moduleStrings={ moduleStrings.filedownloads }
										period={ props.period }
										query={ query }
										summaryUrl={ getStatHref( 'filedownloads', query ) }
										className={ halfWidthModuleClasses }
									/>
								)
							}

							{ supportsDevicesStats && ! isOldJetpack && (
								<StatsModuleDevices
									siteId={ siteId }
									period={ props.period }
									query={ query }
									className={ halfWidthModuleClasses }
								/>
							) }

							{ supportsDevicesStats && isOldJetpack && (
								<StatsModuleUpgradeDevicesOverlay
									className={ halfWidthModuleClasses }
									siteId={ siteId }
									overlay={
										<StatsCardUpdateJetpackVersion
											className="stats-module__upsell stats-module__upgrade"
											siteId={ siteId }
											statType="devices"
										/>
									}
								/>
							) }
						</StatsModuleListing>
					</>
				) }

				{ wpcomShowUpsell && <StatsUpsell siteId={ siteId } /> }
			</div>
			{ supportsPlanUsage && (
				<StatsPlanUsage siteId={ siteId } isOdysseyStats={ isOdysseyStats } />
			) }
			{ ! shouldShowUpsells ? null : (
				<AsyncLoad require="calypso/my-sites/stats/jetpack-upsell-section" />
			) }
			{ ! config.isEnabled( 'stats/paid-wpcom-v3' ) && (
				<PromoCards isOdysseyStats={ isOdysseyStats } pageSlug="traffic" slug={ slug } />
			) }
			{ supportUserFeedback && <StatsFeedbackPresentor siteId={ siteId } /> }
			<JetpackColophon />
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</div>
	);
}

const EnableStatsModule = ( props ) => {
	const dispatch = useDispatch();
	const path = useSelector( ( state ) => getCurrentRouteParameterized( state, props.siteId ) );
	const enableStatsModule = () => {
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_jetpack_module_toggle', {
					module: 'stats',
					path,
					toggled: 'on',
				} ),
				activateModule( props.siteId, 'stats' )
			)
		);
	};

	return (
		<EmptyContent
			illustration={ illustration404 }
			title={ translate( 'Looking for stats?' ) }
			line={
				<p>
					{ translate(
						'Enable %(product)s to see detailed information about your traffic, likes, comments, and subscribers.',
						{ args: { product: STATS_PRODUCT_NAME } }
					) }
				</p>
			}
			action={ translate( 'Enable %(product)s', { args: { product: STATS_PRODUCT_NAME } } ) }
			actionCallback={ enableStatsModule }
		/>
	);
};

const InsufficientPermissionsPage = () => {
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
};

const StatsBodyAccessCheck = ( props ) => {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, props.siteId ) );
	const canUserManageOptions = useSelector( ( state ) =>
		canCurrentUser( state, props.siteId, 'manage_options' )
	);
	const canUserViewStats = useSelector(
		( state ) =>
			isOdysseyStats || canUserManageOptions || canCurrentUser( state, props.siteId, 'view_stats' )
	);
	const showEnableStatsModule = useSelector(
		( state ) =>
			! isOdysseyStats &&
			props.siteId &&
			isJetpack &&
			isJetpackModuleActive( state, props.siteId, 'stats' ) === false &&
			canUserManageOptions
	);

	if ( ! canUserViewStats ) {
		return <InsufficientPermissionsPage />;
	} else if ( showEnableStatsModule ) {
		return <EnableStatsModule siteId={ props.siteId } />;
	}

	return <StatsBody { ...props } />;
};

const StatsSite = ( props ) => {
	const { period } = props.period;
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	useEffect(
		() =>
			// Necessary to properly configure the fixed navigation headers.
			sessionStorage.setItem( 'jp-stats-last-tab', 'traffic' ),
		[]
	); // Track the last viewed tab.

	return (
		<Main fullWidthLayout ariaLabel={ STATS_PRODUCT_NAME }>
			{ /* Odyssey: Google Business Profile pages are currently unsupported. */ }
			{ ! isOdysseyStats && (
				<>
					<QueryKeyringConnections />
					<QuerySiteKeyrings siteId={ siteId } />
				</>
			) }
			{ /* Odyssey: if Stats module is not enabled, the page will not be rendered. */ }
			{ ! isOdysseyStats && isJetpack && <QueryJetpackModules siteId={ siteId } /> }
			<DocumentHead title={ STATS_PRODUCT_NAME } />
			<PageViewTracker
				path={ `/stats/${ period }/:site` }
				title={ `Stats > ${ titlecase( period ) }` }
			/>
			<StatsGlobalValuesContext.Consumer>
				{ ( isInternal ) => (
					<StatsBodyAccessCheck isInternal={ isInternal } siteId={ siteId } { ...props } />
				) }
			</StatsGlobalValuesContext.Consumer>
		</Main>
	);
};

export default localize( StatsSite );
