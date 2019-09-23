/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import { format as formatUrl, parse as parseUrl } from 'url';
import { memoize } from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { abtest } from 'lib/abtest';
import CurrentSite from 'my-sites/current-site';
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import ExternalLink from 'components/external-link';
import JetpackLogo from 'components/jetpack-logo';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import SiteMenu from './site-menu';
import StatsSparkline from 'blocks/stats-sparkline';
import ToolsMenu from './tools-menu';
import { isFreeTrial, isPersonal, isPremium, isBusiness, isEcommerce } from 'lib/products-values';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isSidebarSectionOpen } from 'state/my-sites/sidebar/selectors';
import { setNextLayoutFocus, setLayoutFocus } from 'state/ui/layout-focus/actions';
import canCurrentUser from 'state/selectors/can-current-user';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import hasJetpackSites from 'state/selectors/has-jetpack-sites';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import {
	getCustomizerUrl,
	getSite,
	isJetpackSite,
	canCurrentUserUseAds,
	canCurrentUserUseEarn,
	canCurrentUserUseStore,
	canCurrentUserUseChecklistMenu,
} from 'state/sites/selectors';
import canCurrentUserUseCustomerHome from 'state/sites/selectors/can-current-user-use-customer-home';
import canCurrentUserManagePlugins from 'state/selectors/can-current-user-manage-plugins';
import { getStatsPathForTab } from 'lib/route';
import { itemLinkMatches } from './utils';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import {
	expandMySitesSidebarSection as expandSection,
	toggleMySitesSidebarSection as toggleSection,
} from 'state/my-sites/sidebar/actions';
import { canCurrentUserUpgradeSite } from '../../state/sites/selectors';
import isVipSite from 'state/selectors/is-vip-site';
import isSiteUsingFullSiteEditing from 'state/selectors/is-site-using-full-site-editing';
import {
	SIDEBAR_SECTION_SITE,
	SIDEBAR_SECTION_DESIGN,
	SIDEBAR_SECTION_TOOLS,
	SIDEBAR_SECTION_MANAGE,
} from './constants';

/**
 * Style dependencies
 */
import './style.scss';

export class MySitesSidebar extends Component {
	static propTypes = {
		setNextLayoutFocus: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		path: PropTypes.string,
		currentUser: PropTypes.object,
		isDomainOnly: PropTypes.bool,
		isJetpack: PropTypes.bool,
		isAtomicSite: PropTypes.bool,
	};

	expandSiteSection = () => this.props.expandSection( SIDEBAR_SECTION_SITE );

	expandDesignSection = () => this.props.expandSection( SIDEBAR_SECTION_DESIGN );

	expandToolsSection = () => this.props.expandSection( SIDEBAR_SECTION_TOOLS );

	expandManageSection = () => this.props.expandSection( SIDEBAR_SECTION_MANAGE );

	toggleSection = memoize( id => () => this.props.toggleSection( id ) );

	onNavigate = () => {
		this.props.setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );
	};

	site() {
		return (
			<SiteMenu
				siteId={ this.props.siteId }
				path={ this.props.path }
				isAtomicSite={ this.props.isAtomicSite }
				onNavigate={ this.onNavigate }
			/>
		);
	}

	tools() {
		if ( ! this.props.canUserManageOptions && ! this.props.canUserManagePlugins ) {
			return null;
		}

		return (
			<ToolsMenu
				siteId={ this.props.siteId }
				path={ this.props.path }
				isAtomicSite={ this.props.isAtomicSite }
				onNavigate={ this.onNavigate }
			/>
		);
	}

	trackStatsClick = () => {
		this.trackMenuItemClick( 'stats' );
		this.onNavigate();
	};

	stats() {
		const { site, siteId, canUserViewStats, path, translate } = this.props;

		if ( siteId && ! canUserViewStats ) {
			return null;
		}

		const statsLink = getStatsPathForTab( 'day', site ? site.slug : siteId );
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<SidebarItem
				tipTarget="menus"
				label={ translate( 'Stats' ) }
				className="stats"
				selected={ itemLinkMatches(
					[ '/stats', '/store/stats', '/google-my-business/stats' ],
					path
				) }
				link={ statsLink }
				onNavigate={ this.trackStatsClick }
				materialIcon="bar_chart"
			>
				<StatsSparkline className="sidebar__sparkline" siteId={ siteId } />
			</SidebarItem>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	trackCustomerHomeClick = () => {
		this.trackMenuItemClick( this.props.isCustomerHomeEnabled ? 'customer-home' : 'checklist' );
		this.onNavigate();
	};

	customerHome() {
		const {
			canUserUseChecklistMenu,
			canUserUseCustomerHome,
			path,
			siteSuffix,
			siteId,
			translate,
			isCustomerHomeEnabled,
		} = this.props;

		// This will be eventually removed when Customer Home is finally live
		const canUserViewChecklistOrCustomerHome = isCustomerHomeEnabled
			? canUserUseCustomerHome
			: canUserUseChecklistMenu;

		if ( ! siteId || ! canUserViewChecklistOrCustomerHome ) {
			return null;
		}

		const itemProps = isCustomerHomeEnabled
			? {
					label: translate( 'My Home' ),
					selected: itemLinkMatches( [ '/home' ], path ),
					link: '/home' + siteSuffix,
			  }
			: {
					label: translate( 'Checklist' ),
					selected: itemLinkMatches( [ '/checklist' ], path ),
					link: '/checklist' + siteSuffix,
			  };

		return (
			<SidebarItem
				materialIcon="home"
				tipTarget="menus"
				onNavigate={ this.trackCustomerHomeClick }
				{ ...itemProps }
			/>
		);
	}

	trackActivityClick = () => {
		this.trackMenuItemClick( 'activity' );
		this.onNavigate();
	};

	activity() {
		const { siteId, canUserViewActivity, path, translate, siteSuffix } = this.props;

		if ( ! siteId ) {
			return null;
		}

		if ( ! canUserViewActivity ) {
			return null;
		}

		const activityLink = '/activity-log' + siteSuffix;
		return (
			<SidebarItem
				tipTarget="activity"
				label={ translate( 'Activity' ) }
				selected={ itemLinkMatches( [ '/activity-log' ], path ) }
				link={ activityLink }
				onNavigate={ this.trackActivityClick }
				expandSection={ this.expandToolsSection }
			/>
		);
	}

	trackEarnClick = () => {
		this.trackMenuItemClick( 'earn' );
		this.onNavigate();
	};

	earn() {
		const { site, canUserUseEarn } = this.props;

		if ( site && ! canUserUseEarn ) {
			return null;
		}

		const { path, translate } = this.props;

		return (
			<SidebarItem
				label={ translate( 'Earn' ) }
				selected={ itemLinkMatches( '/earn', path ) }
				link={ '/earn' + this.props.siteSuffix }
				onNavigate={ this.trackEarnClick }
				tipTarget="earn"
				expandSection={ this.expandToolsSection }
			/>
		);
	}

	trackCustomizeClick = () => {
		this.trackMenuItemClick( 'customize' );
		this.onNavigate();
	};

	themes() {
		const { path, site, translate, canUserEditThemeOptions } = this.props;

		if ( site && ! canUserEditThemeOptions ) {
			return null;
		}

		return (
			<SidebarItem
				label={ translate( 'Customize' ) }
				tipTarget="themes"
				selected={ itemLinkMatches( '/customize', path ) }
				link={ this.props.customizeUrl }
				onNavigate={ this.trackCustomizeClick }
				preloadSectionName="customize"
				forceInternalLink
				expandSection={ this.expandDesignSection }
			/>
		);
	}

	design() {
		const { path, site, translate, canUserEditThemeOptions, showCustomizerLink } = this.props,
			jetpackEnabled = isEnabled( 'manage/themes-jetpack' );
		let themesLink;

		if ( site && ! canUserEditThemeOptions ) {
			return null;
		}

		if ( this.props.isJetpack && ! jetpackEnabled && site.options ) {
			themesLink = site.options.admin_url + 'themes.php';
		} else if ( this.props.siteId ) {
			themesLink = '/themes' + this.props.siteSuffix;
		} else {
			themesLink = '/themes';
		}

		return (
			<ul>
				{ showCustomizerLink && (
					<SidebarItem
						label={ translate( 'Customize' ) }
						selected={ itemLinkMatches( '/customize', path ) }
						link={ this.props.customizeUrl }
						onNavigate={ this.trackCustomizeClick }
						preloadSectionName="customize"
						forceInternalLink
						expandSection={ this.expandDesignSection }
					/>
				) }
				<SidebarItem
					label={ translate( 'Themes' ) }
					selected={ itemLinkMatches( themesLink, path ) }
					link={ themesLink }
					onNavigate={ this.trackCustomizeClick }
					preloadSectionName="themes"
					forceInternalLink
					expandSection={ this.expandDesignSection }
				/>
			</ul>
		);
	}

	trackDomainsClick = () => {
		this.trackMenuItemClick( 'domains' );
		this.onNavigate();
	};

	upgrades() {
		const { path, translate, canUserManageOptions } = this.props;
		const domainsLink = '/domains/manage' + this.props.siteSuffix;

		if ( ! this.props.siteId ) {
			return null;
		}

		if ( ! canUserManageOptions ) {
			return null;
		}

		if ( this.props.isJetpack && ! this.props.isAtomicSite ) {
			return null;
		}

		return (
			<SidebarItem
				label={ translate( 'Domains' ) }
				selected={ itemLinkMatches( [ '/domains', '/email' ], path ) }
				link={ domainsLink }
				onNavigate={ this.trackDomainsClick }
				preloadSectionName="domains"
				tipTarget="domains"
				expandSection={ this.expandManageSection }
			/>
		);
	}

	plan() {
		const { path, site, translate, canUserManageOptions } = this.props;

		if ( ! site ) {
			return null;
		}

		if ( ! canUserManageOptions ) {
			return null;
		}

		let planLink = '/plans' + this.props.siteSuffix;

		// Show plan details for upgraded sites
		if (
			isPersonal( site.plan ) ||
			isPremium( site.plan ) ||
			isBusiness( site.plan ) ||
			isEcommerce( site.plan )
		) {
			planLink = '/plans/my-plan' + this.props.siteSuffix;
		}

		const linkClass = classNames( {
			selected: itemLinkMatches( [ '/plans' ], path ),
		} );

		const tipTarget = 'plan';

		let planName = site && site.plan.product_name_short;

		if ( site && isFreeTrial( site.plan ) ) {
			planName = translate( 'Trial', {
				context: 'Label in the sidebar indicating that the user is on the free trial for a plan.',
			} );
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<li className={ linkClass } data-tip-target={ tipTarget }>
				<a className="sidebar__menu-link" onClick={ this.trackPlanClick } href={ planLink }>
					<JetpackLogo className="sidebar__menu-icon" size={ 24 } />
					<span className="menu-link-text" data-e2e-sidebar="Plan">
						{ translate( 'Plan', { context: 'noun' } ) }
					</span>
					<span className="sidebar__menu-link-secondary-text">{ planName }</span>
				</a>
			</li>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	trackStoreClick = () => {
		this.trackMenuItemClick( 'store' );
		this.props.recordTracksEvent( 'calypso_woocommerce_store_nav_item_click' );
		this.onNavigate();
	};

	store() {
		const { translate, site, siteSuffix, canUserUseStore } = this.props;

		if ( ! isEnabled( 'woocommerce/extension-dashboard' ) || ! site ) {
			return null;
		}

		if ( ! canUserUseStore ) {
			return null;
		}

		if ( ! isEnabled( 'woocommerce/extension-dashboard' ) || ! site ) {
			return null;
		}

		let storeLink = '/store' + siteSuffix;
		if ( isEcommerce( site.plan ) ) {
			storeLink = site.options.admin_url + 'admin.php?page=wc-setup-checklist';
		}

		return (
			<SidebarItem
				label={ translate( 'Store' ) }
				link={ storeLink }
				onNavigate={ this.trackStoreClick }
				materialIcon="shopping_cart"
				forceInternalLink
			/>
		);
	}

	trackMenuItemClick = menuItemName => {
		this.props.recordTracksEvent(
			'calypso_mysites_sidebar_' + menuItemName.replace( /-/g, '_' ) + '_clicked'
		);
	};

	trackPlanClick = () => {
		this.trackMenuItemClick( 'plan' );
		this.props.recordTracksEvent( 'calypso_upgrade_nudge_cta_click', {
			cta_name: 'sidebar_upgrade_default',
		} );
		this.onNavigate();
	};

	trackMarketingClick = () => {
		this.trackMenuItemClick( 'marketing' );
		this.onNavigate();
	};

	marketing() {
		const { path, site } = this.props;
		const marketingLink = '/marketing' + this.props.siteSuffix;

		if ( site && ! this.props.canUserPublishPosts ) {
			return null;
		}

		if ( ! this.props.siteId ) {
			return null;
		}

		return (
			<SidebarItem
				label={ this.props.translate( 'Marketing' ) }
				selected={ itemLinkMatches( '/marketing', path ) }
				link={ marketingLink }
				onNavigate={ this.trackMarketingClick }
				preloadSectionName="marketing"
				tipTarget="marketing"
				expandSection={ this.expandToolsSection }
			/>
		);
	}

	trackPeopleClick = () => {
		this.trackMenuItemClick( 'people' );
		this.onNavigate();
	};

	users() {
		const { translate, path, site, canUserListUsers } = this.props;

		if ( ! site || ! canUserListUsers ) {
			return null;
		}

		return (
			<SidebarItem
				label={ translate( 'People' ) }
				selected={ itemLinkMatches( '/people', path ) }
				link={ '/people/team' + this.props.siteSuffix }
				onNavigate={ this.trackPeopleClick }
				preloadSectionName="people"
				tipTarget="people"
				expandSection={ this.expandManageSection }
			/>
		);
	}

	trackSettingsClick = () => {
		this.trackMenuItemClick( 'settings' );
		this.onNavigate();
	};

	siteSettings() {
		const { path, site, canUserManageOptions } = this.props;
		const siteSettingsLink = '/settings/general' + this.props.siteSuffix;

		if ( site && ! canUserManageOptions ) {
			return null;
		}

		if ( ! this.props.siteId ) {
			return null;
		}

		return (
			<SidebarItem
				label={ this.props.translate( 'Settings' ) }
				selected={ itemLinkMatches( '/settings', path ) }
				link={ siteSettingsLink }
				onNavigate={ this.trackSettingsClick }
				preloadSectionName="settings"
				tipTarget="settings"
				expandSection={ this.expandManageSection }
			/>
		);
	}

	wpAdmin() {
		const { site } = this.props;

		if ( ! site || ! site.options ) {
			return null;
		}

		if ( ! this.useWPAdminFlows() ) {
			return null;
		}

		const adminUrl =
			this.props.isJetpack && ! this.props.isAtomicSite && ! this.props.isVip
				? formatUrl( {
						...parseUrl( site.options.admin_url + 'admin.php' ),
						query: { page: 'jetpack' },
						hash: '/my-plan',
				  } )
				: site.options.admin_url;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<SidebarMenu className="sidebar__wp-admin">
				<ul>
					<li>
						<ExternalLink
							className="sidebar__menu-link"
							href={ adminUrl }
							icon
							onClick={ this.trackWpadminClick }
						>
							<Gridicon className={ 'sidebar__menu-icon' } icon="my-sites" size={ 24 } />
							<span className="menu-link-text">{ this.props.translate( 'WP Admin' ) }</span>
						</ExternalLink>
					</li>
				</ul>
			</SidebarMenu>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	// Check for cases where WP Admin links should appear, where we need support for legacy reasons (VIP, older users, testing).
	useWPAdminFlows() {
		const { isJetpack, isVip } = this.props;
		const currentUser = this.props.currentUser;
		const userRegisteredDate = new Date( currentUser.date );
		const cutOffDate = new Date( '2015-09-07' );

		// VIP sites should always show a WP Admin link regardless of the current user.
		if ( isVip ) {
			return true;
		}

		// Jetpack (including Atomic) sites should always show a WP Admin
		if ( isJetpack ) {
			return true;
		}

		// User registered before the cut-off date of September 7, 2015 and we want to support them as legacy users.
		if ( userRegisteredDate < cutOffDate ) {
			return true;
		}

		return false;
	}

	trackWpadminClick = () => {
		this.trackMenuItemClick( 'wpadmin' );
		this.props.recordGoogleEvent( 'Sidebar', 'Clicked WP Admin' );
	};

	focusContent = () => {
		this.props.setLayoutFocus( 'content' );
	};

	getAddNewSiteUrl() {
		return '/jetpack/new/?ref=calypso-selector';
	}

	addNewSite() {
		if ( this.props.currentUser.visible_site_count > 1 ) {
			return null;
		}

		return (
			<SidebarItem
				label={ this.props.translate( 'Add new site' ) }
				link={ this.getAddNewSiteUrl() }
				onNavigate={ this.focusContent }
				icon="add-outline"
			/>
		);
	}

	trackDomainSettingsClick = () => {
		this.trackMenuItemClick( 'domain_settings' );
		this.onNavigate();
	};

	renderSidebarMenus() {
		if ( this.props.isDomainOnly ) {
			return (
				<SidebarMenu>
					<ul>
						<SidebarItem
							selected={ itemLinkMatches( '/domains', this.props.path ) }
							label={ this.props.translate( 'Settings' ) }
							link={ '/domains/manage' + this.props.siteSuffix }
							onNavigate={ this.trackDomainSettingsClick }
							tipTarget="settings"
						/>
					</ul>
				</SidebarMenu>
			);
		}

		const tools = !! this.tools() || !! this.marketing() || !! this.earn() || !! this.activity();
		const manage = !! this.upgrades() || !! this.users() || !! this.siteSettings();

		return (
			<div className="sidebar__menu-wrapper">
				<SidebarMenu>
					<ul>
						{ this.customerHome() }
						{ this.stats() }
						{ this.plan() }
						{ this.store() }
					</ul>
				</SidebarMenu>

				<ExpandableSidebarMenu
					onClick={ this.toggleSection( SIDEBAR_SECTION_SITE ) }
					expanded={ this.props.isSiteSectionOpen }
					title={ this.props.translate( 'Site' ) }
					materialIcon="edit"
				>
					{ this.site() }
				</ExpandableSidebarMenu>

				{ this.design() ? (
					<ExpandableSidebarMenu
						onClick={ this.toggleSection( SIDEBAR_SECTION_DESIGN ) }
						expanded={ this.props.isDesignSectionOpen }
						title={ this.props.translate( 'Design' ) }
						materialIcon="gesture"
					>
						{ this.design() }
					</ExpandableSidebarMenu>
				) : null }

				{ tools && (
					<ExpandableSidebarMenu
						onClick={ this.toggleSection( SIDEBAR_SECTION_TOOLS ) }
						expanded={ this.props.isToolsSectionOpen }
						title={ this.props.translate( 'Tools' ) }
						materialIcon="build"
					>
						{ this.tools() }
						{ this.marketing() }
						{ this.earn() }
						{ this.activity() }
					</ExpandableSidebarMenu>
				) }

				{ manage && (
					<ExpandableSidebarMenu
						onClick={ this.toggleSection( SIDEBAR_SECTION_MANAGE ) }
						expanded={ this.props.isManageSectionOpen }
						title={ this.props.translate( 'Manage' ) }
						materialIcon="settings"
					>
						<ul>
							{ this.upgrades() }
							{ this.users() }
							{ this.siteSettings() }
						</ul>
					</ExpandableSidebarMenu>
				) }

				{ this.wpAdmin() }
			</div>
		);
	}

	render() {
		return (
			<Sidebar>
				<SidebarRegion>
					<CurrentSite />
					{ this.renderSidebarMenus() }
				</SidebarRegion>
				<SidebarFooter>{ this.addNewSite() }</SidebarFooter>
			</Sidebar>
		);
	}
}

function mapStateToProps( state ) {
	const currentUser = getCurrentUser( state );
	const selectedSiteId = getSelectedSiteId( state );
	const isSingleSite = !! selectedSiteId || currentUser.site_count === 1;
	const siteId = selectedSiteId || ( isSingleSite && getPrimarySiteId( state ) ) || null;
	const site = getSite( state, siteId );

	const isJetpack = isJetpackSite( state, siteId );

	const isSiteSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_SITE );
	const isDesignSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_DESIGN );
	const isToolsSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_TOOLS );
	const isManageSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_MANAGE );
	const isCustomerHomeEnabled = 'show' === abtest( 'customerHomePage' );

	return {
		canUserEditThemeOptions: canCurrentUser( state, siteId, 'edit_theme_options' ),
		canUserListUsers: canCurrentUser( state, siteId, 'list_users' ),
		canUserViewActivity: canCurrentUser( state, siteId, 'manage_options' ),
		canUserManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
		canUserPublishPosts: canCurrentUser( state, siteId, 'publish_posts' ),
		canUserViewStats: canCurrentUser( state, siteId, 'view_stats' ),
		canUserManagePlugins: canCurrentUserManagePlugins( state ),
		canUserUseChecklistMenu: canCurrentUserUseChecklistMenu( state, siteId ),
		canUserUseStore: canCurrentUserUseStore( state, siteId ),
		canUserUseEarn: canCurrentUserUseEarn( state, siteId ),
		canUserUseCustomerHome: canCurrentUserUseCustomerHome( state, siteId ),
		isCustomerHomeEnabled,
		canUserUseAds: canCurrentUserUseAds( state, siteId ),
		canUserUpgradeSite: canCurrentUserUpgradeSite( state, siteId ),
		currentUser,
		customizeUrl: getCustomizerUrl( state, selectedSiteId ),
		hasJetpackSites: hasJetpackSites( state ),
		isDomainOnly: isDomainOnlySite( state, selectedSiteId ),
		isJetpack,
		isSiteSectionOpen,
		isDesignSectionOpen,
		isToolsSectionOpen,
		isManageSectionOpen,
		isAtomicSite: !! isSiteAutomatedTransfer( state, selectedSiteId ),
		isVip: isVipSite( state, selectedSiteId ),
		showCustomizerLink: ! isSiteUsingFullSiteEditing( state, selectedSiteId ),
		siteId,
		site,
		siteSuffix: site ? '/' + site.slug : '',
	};
}

export default connect(
	mapStateToProps,
	{
		recordGoogleEvent,
		recordTracksEvent,
		setLayoutFocus,
		setNextLayoutFocus,
		expandSection,
		toggleSection,
	}
)( localize( MySitesSidebar ) );
