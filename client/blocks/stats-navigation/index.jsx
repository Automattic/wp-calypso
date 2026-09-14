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
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isGoogleMyBusinessLocationConnectedSelector from 'calypso/state/selectors/is-google-my-business-location-connected';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isSiteStore from 'calypso/state/selectors/is-site-store';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteOption, isSimpleSite } from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import {
	updateModuleToggles,
	requestModuleToggles,
} from 'calypso/state/stats/module-toggles/actions';
import { getModuleToggles } from 'calypso/state/stats/module-toggles/selectors';
import { navItems as allNavItems, intervals as intervalConstants } from './constants';
import Intervals from './intervals';

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
		const { slug, selectedItem, interval, isLegacy, showLock, siteId, adminUrl } = this.props;
		const { path } = allNavItems[ selectedItem ];
		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ path }/{{ interval }}${ slugPath }`;

		const wrapperClass = clsx( 'stats-navigation', 'stats-navigation--improved', {
			'stats-navigation--modernized': ! isLegacy,
		} );

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
			</div>
		);
	}
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
			adminUrl: getSiteAdminUrl( state, siteId ),
		};
	},
	{ requestModuleToggles, updateModuleToggles }
)( localize( StatsNavigation ) );
