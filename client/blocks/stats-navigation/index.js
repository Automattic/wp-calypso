import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { ComponentSwapper } from '@automattic/components';
import { TabPanel } from '@wordpress/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import version_compare from 'calypso/lib/version-compare';
import { STATS_FEATURE_PAGE_TRAFFIC } from 'calypso/my-sites/stats/constants';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { shouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isGoogleMyBusinessLocationConnectedSelector from 'calypso/state/selectors/is-google-my-business-location-connected';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isSiteStore from 'calypso/state/selectors/is-site-store';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	getJetpackStatsAdminVersion,
	getSiteOption,
	isSimpleSite,
} from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import {
	updateModuleToggles,
	requestModuleToggles,
} from 'calypso/state/stats/module-toggles/actions';
import { getModuleToggles } from 'calypso/state/stats/module-toggles/selectors';
import {
	AVAILABLE_PAGE_MODULES,
	navItems as allNavItems,
	intervals as intervalConstants,
} from './constants';
import Intervals from './intervals';
import PageModuleToggler from './page-module-toggler';

import './style.scss';

/**
 * @typedef {{
 *   name: string,
 *   label: string,
 *   title: string,
 *   className: string,
 *   path: string,
 *   storeAdminUrl: string,
 *   showIntervals: boolean,
 * }} StatsNavItem
 */

// Use HOC to wrap hooks of `react-query` for fetching the notice visibility state.
function withNoticeHook( HookedComponent ) {
	return function WrappedComponent( props ) {
		const { data: showSettingsTooltip, refetch: refetchNotices } = useNoticeVisibilityQuery(
			props.siteId,
			'traffic_page_settings'
		);

		const { mutateAsync: mutateNoticeVisbilityAsync } = useNoticeVisibilityMutation(
			props.siteId,
			'traffic_page_settings'
		);

		return (
			<HookedComponent
				{ ...props }
				showSettingsTooltip={ showSettingsTooltip }
				refetchNotices={ refetchNotices }
				mutateNoticeVisbilityAsync={ mutateNoticeVisbilityAsync }
			/>
		);
	};
}
/**
 * @param { { navItems: StatsNavItem[], selectedItemName: keyof typeof allNavItems, isLegacy: boolean, interval: string, pathTemplate: string } } props
 */
const SelectNav = ( { navItems, selectedItemName, isLegacy, interval, pathTemplate } ) => {
	const selectedNavItem = navItems.find( ( { name } ) => name === selectedItemName );
	if ( ! selectedNavItem ) {
		return null;
	}

	const { label, showIntervals } = selectedNavItem;

	return (
		<>
			<SectionNav selectedText={ label }>
				<NavTabs selectedText={ label }>
					{ navItems.map( ( navItem ) => {
						if ( navItem.name === 'store' && config.isEnabled( 'is_running_in_jetpack_site' ) ) {
							return (
								<NavItem
									className={ navItem.className }
									key={ navItem.name }
									onClick={ () => ( window.location.href = navItem.storeAdminUrl ) }
									selected={ false }
								>
									{ navItem.label }
								</NavItem>
							);
						}
						return (
							<NavItem
								className={ navItem.className }
								key={ navItem.name }
								path={ navItem.path }
								selected={ selectedItemName === navItem.name }
							>
								{ navItem.title }
							</NavItem>
						);
					} ) }
				</NavTabs>

				{ isLegacy && showIntervals && (
					<Intervals selected={ interval } pathTemplate={ pathTemplate } />
				) }
			</SectionNav>

			{ isLegacy && showIntervals && (
				<Intervals selected={ interval } pathTemplate={ pathTemplate } standalone />
			) }
		</>
	);
};

/**
 * @param { { tabs: StatsNavItem[], selectedTabName: keyof typeof allNavItems } } props
 */
const TabNav = ( { tabs, selectedTabName } ) => {
	return (
		<TabPanel
			className="stats-navigation__tabs"
			tabs={ tabs }
			onSelect={ ( newSelectedTabName ) => {
				// Skip navigation if the clicked tab is already active to avoid redundant actions.
				if ( newSelectedTabName === selectedTabName ) {
					return;
				}

				const selectedTab = tabs.find( ( { name } ) => name === newSelectedTabName );

				if ( selectedTab.name === 'store' && config.isEnabled( 'is_running_in_jetpack_site' ) ) {
					window.location.href = selectedTab.storeAdminUrl;
				} else if ( selectedTab.path ) {
					page( selectedTab.path );
				}
			} }
			initialTabName={ selectedTabName }
		>
			{ () => (
				// Placeholder div since content is rendered elsewhere
				<div className="stats-navigation__content" />
			) }
		</TabPanel>
	);
};

class StatsNavigation extends Component {
	static propTypes = {
		interval: PropTypes.oneOf( intervalConstants.map( ( i ) => i.value ) ),
		isGoogleMyBusinessLocationConnected: PropTypes.bool.isRequired,
		isStore: PropTypes.bool,
		isWordAds: PropTypes.bool,
		isSubscriptionsModuleActive: PropTypes.bool,
		isSimple: PropTypes.bool,
		isSiteJetpackNotAtomic: PropTypes.bool,
		hasVideoPress: PropTypes.bool,
		selectedItem: PropTypes.oneOf( Object.keys( allNavItems ) ).isRequired,
		siteId: PropTypes.number,
		slug: PropTypes.string,
		isLegacy: PropTypes.bool,
		adminUrl: PropTypes.string,
		showLock: PropTypes.bool,
		hideModuleSettings: PropTypes.bool,
		delayTooltipPresentation: PropTypes.bool,
	};

	state = {
		// Dismiss the tooltip before the API call is finished.
		isPageSettingsTooltipDismissed: !! localStorage.getItem(
			'notices_dismissed__traffic_page_settings'
		),
	};

	onTooltipDismiss = () => {
		if ( this.state.isPageSettingsTooltipDismissed || ! this.props.showSettingsTooltip ) {
			return;
		}
		this.setState( { isPageSettingsTooltipDismissed: true } );
		localStorage.setItem( 'notices_dismissed__traffic_page_settings', 1 );
		this.props.mutateNoticeVisbilityAsync().finally( this.props.refetchNotices );
	};

	isValidItem = ( item ) => {
		const {
			isGoogleMyBusinessLocationConnected,
			isStore,
			isWordAds,
			siteId,
			isSubscriptionsModuleActive,
			isSimple,
		} = this.props;

		switch ( item ) {
			case 'wordads':
				return isWordAds;

			case 'store':
				return isStore;

			case 'googleMyBusiness':
				if ( 'undefined' === typeof siteId ) {
					return false;
				}

				return config.isEnabled( 'google-my-business' ) && isGoogleMyBusinessLocationConnected;

			case 'subscribers':
				if ( 'undefined' === typeof siteId ) {
					return false;
				}

				return isSimple ? true : isSubscriptionsModuleActive;

			case 'realtime':
				if ( 'undefined' === typeof siteId ) {
					return false;
				}
				return config.isEnabled( 'stats/real-time-tab' );

			default:
				return true;
		}
	};

	componentDidMount() {
		this.props.requestModuleToggles( this.props.siteId );
	}

	render() {
		const {
			slug,
			selectedItem,
			interval,
			isLegacy,
			showSettingsTooltip,
			statsAdminVersion,
			showLock,
			hideModuleSettings,
			delayTooltipPresentation,
			gatedTrafficPage,
			siteId,
			isStatsNavigationImprovementEnabled,
			pageModuleToggles,
			adminUrl,
		} = this.props;
		const { isPageSettingsTooltipDismissed } = this.state;
		const { path } = allNavItems[ selectedItem ];
		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ path }/{{ interval }}${ slugPath }`;

		const wrapperClass = clsx( 'stats-navigation', {
			'stats-navigation--modernized': ! isLegacy,
			'stats-navigation--improved': isStatsNavigationImprovementEnabled,
		} );

		// Module settings for Odyssey are not supported until stats-admin@0.9.0-alpha.
		const isModuleSettingsSupported =
			! config.isEnabled( 'is_running_in_jetpack_site' ) ||
			!! ( statsAdminVersion && version_compare( statsAdminVersion, '0.9.0-alpha', '>=' ) );

		const shouldRenderModuleToggler =
			isModuleSettingsSupported &&
			AVAILABLE_PAGE_MODULES[ this.props.selectedItem ] &&
			! hideModuleSettings &&
			! gatedTrafficPage;

		// @TODO: Add loading status of modules settings to avoid toggling modules before they are loaded.

		/** @type {Array<keyof typeof allNavItems>} Array of valid navigation item keys */
		const navKeys = Object.keys( allNavItems );
		const navItems = navKeys.filter( this.isValidItem ).map( ( key ) => {
			const navItem = allNavItems[ key ];

			if ( ! navItem ) {
				throw new Error( `navItem is null for key: ${ key }` );
			}

			const intervalPath = navItem.showIntervals ? `/${ interval || 'day' }` : '';
			const itemPath = `${ navItem.path }${ intervalPath }${ slugPath }`;
			return {
				name: key,
				storeAdminUrl: `${ adminUrl }admin.php?page=wc-admin&path=%2Fanalytics%2Foverview`,
				className: 'stats-navigation__' + key,
				label: navItem.label,
				path: itemPath,
				showIntervals: navItem.showIntervals,
				title: navItem.label + ( navItem.paywall && showLock ? ' 🔒' : '' ),
			};
		} );

		return (
			<div className={ wrapperClass }>
				{ siteId && <QueryJetpackModules siteId={ siteId } /> }
				{ isStatsNavigationImprovementEnabled && (
					<ComponentSwapper
						className="full-width"
						breakpoint="<480px"
						breakpointActiveComponent={
							<SelectNav
								navItems={ navItems }
								selectedItemName={ selectedItem }
								isLegacy={ isLegacy }
								interval={ interval }
								pathTemplate={ pathTemplate }
							/>
						}
						breakpointInactiveComponent={
							<TabNav tabs={ navItems } selectedTabName={ selectedItem } />
						}
					/>
				) }
				{ ! isStatsNavigationImprovementEnabled && (
					// TODO: remove following SelectNav after 'stats/navigation-improvement' launch.
					<SelectNav
						navItems={ navItems }
						selectedItemName={ selectedItem }
						isLegacy={ isLegacy }
						interval={ interval }
						pathTemplate={ pathTemplate }
					/>
				) }

				{ ! isStatsNavigationImprovementEnabled && shouldRenderModuleToggler && (
					<PageModuleToggler
						siteId={ siteId }
						selectedItem={ selectedItem }
						moduleToggles={ pageModuleToggles }
						isTooltipShown={
							showSettingsTooltip && ! isPageSettingsTooltipDismissed && ! delayTooltipPresentation
						}
						onTooltipDismiss={ this.onTooltipDismiss }
					/>
				) }
			</div>
		);
	}
}

function shouldDelayTooltipPresentation( state, siteId ) {
	// Check the 'created_at' time stamp.
	// Can return null (Redux hydration?) which we'll treat as a delay.
	const siteCreatedTimeStamp = getSiteOption( state, siteId, 'created_at' );
	if ( siteCreatedTimeStamp === null ) {
		return true;
	}

	// Check if the site is less than one week old.
	const WEEK_IN_MILLISECONDS = 7 * 1000 * 3600 * 24;
	const siteIsLessThanOneWeekOld =
		new Date( siteCreatedTimeStamp ) > new Date( Date.now() - WEEK_IN_MILLISECONDS );
	if ( siteIsLessThanOneWeekOld ) {
		return true;
	}

	return false;
}

export default connect(
	( state, { siteId, selectedItem } ) => {
		return {
			isGoogleMyBusinessLocationConnected: isGoogleMyBusinessLocationConnectedSelector(
				state,
				siteId
			),
			isStore: isSiteStore( state, siteId ),
			isWordAds:
				getSiteOption( state, siteId, 'wordads' ) &&
				canCurrentUser( state, siteId, 'manage_options' ),
			hasVideoPress: siteHasFeature( state, siteId, 'videopress' ),
			isSimple: isSimpleSite( state, siteId ),
			isSubscriptionsModuleActive: isJetpackModuleActive( state, siteId, 'subscriptions', true ),
			siteId,
			pageModuleToggles: getModuleToggles( state, siteId, [ selectedItem ] ),
			statsAdminVersion: getJetpackStatsAdminVersion( state, siteId ),
			adminUrl: getSiteAdminUrl( state, siteId ),
			delayTooltipPresentation: shouldDelayTooltipPresentation( state, siteId ),
			gatedTrafficPage:
				config.isEnabled( 'stats/paid-wpcom-v3' ) &&
				shouldGateStats( state, siteId, STATS_FEATURE_PAGE_TRAFFIC ),
			isStatsNavigationImprovementEnabled: config.isEnabled( 'stats/navigation-improvement' ),
		};
	},
	{ requestModuleToggles, updateModuleToggles }
)( localize( withNoticeHook( StatsNavigation ) ) );
