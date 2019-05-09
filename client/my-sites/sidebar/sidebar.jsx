/**
 * External dependencies
 */
import classNames from 'classnames';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import page from 'page';
import { format as formatUrl, parse as parseUrl } from 'url';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { isEnabled } from 'config';
import CurrentSite from 'my-sites/current-site';
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import ManageMenu from './manage-menu';
import Sidebar from 'layout/sidebar';
import SidebarButton from 'layout/sidebar/button';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import SiteMenu from './site-menu';
import StatsSparkline from 'blocks/stats-sparkline';
import ToolsMenu from './tools-menu';
import JetpackLogo from 'components/jetpack-logo';
import { isFreeTrial, isPersonal, isPremium, isBusiness, isEcommerce } from 'lib/products-values';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isSiteMenuOpen,
	isDesignMenuOpen,
	isToolsMenuOpen,
	isManageMenuOpen,
} from 'state/my-sites/sidebar/selectors';
import { setNextLayoutFocus, setLayoutFocus } from 'state/ui/layout-focus/actions';
import canCurrentUser from 'state/selectors/can-current-user';
import canCurrentUserManagePlugins from 'state/selectors/can-current-user-manage-plugins';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import hasJetpackSites from 'state/selectors/has-jetpack-sites';
import hasSitePendingAutomatedTransfer from 'state/selectors/has-site-pending-automated-transfer';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import {
	getCustomizerUrl,
	getSite,
	isJetpackMinimumVersion,
	isJetpackModuleActive,
	isJetpackSite,
	isSitePreviewable,
	canCurrentUserUseAds,
	canCurrentUserUseStore,
} from 'state/sites/selectors';
import { getStatsPathForTab } from 'lib/route';
import { getAutomatedTransferStatus } from 'state/automated-transfer/selectors';
import { transferStates } from 'state/automated-transfer/constants';
import { itemLinkMatches } from './utils';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import {
	toggleMySitesSidebarSiteMenu,
	toggleMySitesSidebarDesignMenu,
	toggleMySitesSidebarToolsMenu,
	toggleMySitesSidebarManageMenu,
} from 'state/my-sites/sidebar/actions';
import { canCurrentUserUpgradeSite } from '../../state/sites/selectors';
import { canAccessEarnSection } from 'lib/ads/utils';
import isVipSite from 'state/selectors/is-vip-site';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:my-sites:sidebar' );

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

	componentDidMount() {
		debug( 'The sidebar React component is mounted.' );
	}

	onNavigate = () => {
		this.props.setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );
	};

	onViewSiteClick = event => {
		const { isPreviewable, siteSuffix } = this.props;

		if ( ! isPreviewable ) {
			this.trackMenuItemClick( 'view_site_unpreviewable' );
			this.props.recordGoogleEvent( 'Sidebar', 'Clicked View Site | Unpreviewable' );
			return;
		}

		if ( event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ) {
			this.trackMenuItemClick( 'view_site_modifier' );
			this.props.recordGoogleEvent( 'Sidebar', 'Clicked View Site | Modifier Key' );
			return;
		}

		event.preventDefault();
		this.trackMenuItemClick( 'view_site' );
		this.props.recordGoogleEvent( 'Sidebar', 'Clicked View Site | Calypso' );
		page( '/view' + siteSuffix );
	};

	manage() {
		return (
			<ManageMenu
				siteId={ this.props.siteId }
				path={ this.props.path }
				isAtomicSite={ this.props.isAtomicSite }
				onNavigate={ this.onNavigate }
			/>
		);
	}

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
		const { siteId, canUserViewStats, path, translate } = this.props;

		if ( siteId && ! canUserViewStats ) {
			return null;
		}

		const statsLink = getStatsPathForTab( 'day', siteId );
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
				icon="stats-alt"
				materialIcon="bar_chart"
			>
				<a href={ statsLink }>
					<StatsSparkline className="sidebar__sparkline" siteId={ siteId } />
				</a>
			</SidebarItem>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
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
				icon="history"
			/>
		);
	}

	preview() {
		const { isPreviewable, path, site, siteId, translate } = this.props;

		if ( ! siteId ) {
			return null;
		}

		const siteUrl = ( site && site.URL ) || '';

		return (
			<SidebarItem
				tipTarget="sitePreview"
				label={ translate( 'View Site' ) }
				selected={ itemLinkMatches( [ '/view' ], path ) }
				link={ siteUrl }
				onNavigate={ this.onViewSiteClick }
				icon="computer"
				preloadSectionName="preview"
				forceInternalLink={ isPreviewable }
			/>
		);
	}

	trackEarnClick = () => {
		this.trackMenuItemClick( 'earn' );
		this.onNavigate();
	};

	earn() {
		const { path, translate, site } = this.props;
		if ( ! canAccessEarnSection( site ) ) {
			return null;
		}

		return (
			<SidebarItem
				label={ translate( 'Earn' ) }
				selected={ itemLinkMatches( '/earn', path ) }
				link={ '/earn' + this.props.siteSuffix }
				onNavigate={ this.trackEarnClick }
				icon="money"
				tipTarget="earn"
			/>
		);
	}

	trackCustomizeClick = () => {
		this.trackMenuItemClick( 'customize' );
		this.onNavigate();
	};

	themes() {
		const { path, site, translate, canUserEditThemeOptions } = this.props,
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
			<SidebarItem
				label={ translate( 'Customize' ) }
				tipTarget="themes"
				selected={ itemLinkMatches( '/customize', path ) }
				link={ this.props.customizeUrl }
				onNavigate={ this.trackCustomizeClick }
				icon="customize"
				preloadSectionName="customize"
				forceInternalLink
			>
				<SidebarButton
					onClick={ this.trackSidebarButtonClick( 'themes' ) }
					href={ themesLink }
					preloadSectionName="themes"
					forceTargetInternal
				>
					{ this.props.translate( 'Themes' ) }
				</SidebarButton>
			</SidebarItem>
		);
	}

	design() {
		const { path, site, translate, canUserEditThemeOptions } = this.props,
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
				<SidebarItem
					label={ translate( 'Customize' ) }
					selected={ itemLinkMatches( '/customize', path ) }
					link={ this.props.customizeUrl }
					onNavigate={ this.trackCustomizeClick }
					icon="customize"
					preloadSectionName="customize"
					forceInternalLink
				/>
				<SidebarItem
					label={ translate( 'Themes' ) }
					selected={ itemLinkMatches( themesLink, path ) }
					link={ themesLink }
					onNavigate={ this.trackCustomizeClick }
					icon="customize"
					preloadSectionName="themes"
					forceInternalLink
				/>
			</ul>
		);
	}

	trackSidebarButtonClick = name => {
		return () => {
			this.props.recordTracksEvent(
				'calypso_mysites_sidebar_' + name.replace( /-/g, '_' ) + '_sidebar_button_clicked'
			);
		};
	};

	trackPluginsClick = () => {
		this.trackMenuItemClick( 'plugins' );
		this.onNavigate();
	};

	plugins() {
		if ( isEnabled( 'calypsoify/plugins' ) ) {
			return null;
		}

		// checks for manage plugins capability across all sites
		if ( ! this.props.canManagePlugins ) {
			return null;
		}

		// if selectedSite and cannot manage, skip plugins section
		if ( this.props.siteId && ! this.props.canUserManageOptions ) {
			return null;
		}

		const pluginsLink = '/plugins' + this.props.siteSuffix;
		const managePluginsLink = '/plugins/manage' + this.props.siteSuffix;

		const manageButton =
			this.props.isJetpack || ( ! this.props.siteId && this.props.hasJetpackSites ) ? (
				<SidebarButton
					onClick={ this.trackSidebarButtonClick( 'manage_plugins' ) }
					href={ managePluginsLink }
				>
					{ this.props.translate( 'Manage' ) }
				</SidebarButton>
			) : null;

		return (
			<SidebarItem
				label={ this.props.translate( 'Plugins' ) }
				selected={ itemLinkMatches( [ '/extensions', '/plugins' ], this.props.path ) }
				link={ pluginsLink }
				onNavigate={ this.trackPluginsClick }
				icon="plugins"
				preloadSectionName="plugins"
				tipTarget="plugins"
			>
				{ manageButton }
			</SidebarItem>
		);
	}

	trackDomainsClick = () => {
		this.trackMenuItemClick( 'domains' );
		this.onNavigate();
	};

	upgrades() {
		const { path, translate, canUserManageOptions } = this.props;
		const domainsLink = '/domains/manage' + this.props.siteSuffix;
		const addDomainLink = '/domains/add' + this.props.siteSuffix;

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
				selected={ itemLinkMatches( [ '/domains' ], path ) }
				link={ domainsLink }
				onNavigate={ this.trackDomainsClick }
				icon="domains"
				preloadSectionName="domains"
				tipTarget="domains"
			>
				<SidebarButton
					onClick={ this.trackSidebarButtonClick( 'add_domain' ) }
					href={ addDomainLink }
				>
					{ translate( 'Add' ) }
				</SidebarButton>
			</SidebarItem>
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
				<a onClick={ this.trackPlanClick } href={ planLink }>
					<JetpackLogo size={ 24 } />
					<span className="menu-link-text" data-e2e-sidebar={ 'Plan' }>
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
				icon="cart"
				materialIcon="shopping_cart"
				forceInternalLink
			>
				<div className="sidebar__chevron-right">
					<Gridicon icon="chevron-right" />
				</div>
			</SidebarItem>
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
				icon="speaker"
				preloadSectionName="marketing"
				tipTarget="marketing"
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
				icon="user"
				preloadSectionName="people"
				tipTarget="people"
			>
				<SidebarButton
					onClick={ this.trackSidebarButtonClick( 'add_people' ) }
					href={ '/people/new' + this.props.siteSuffix }
				>
					{ translate( 'Add' ) }
				</SidebarButton>
			</SidebarItem>
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
				selected={
					itemLinkMatches( '/settings', path ) &&
					( ! isEnabled( 'manage/import-in-sidebar' ) ||
						! itemLinkMatches( '/settings/import', path ) )
				}
				link={ siteSettingsLink }
				onNavigate={ this.trackSettingsClick }
				icon="cog"
				preloadSectionName="settings"
				tipTarget="settings"
			/>
		);
	}

	wpAdmin() {
		const { site } = this.props;

		if ( ! site || ! site.options ) {
			return null;
		}

		if ( ! this.useWPAdminFlows() && ! this.props.isAtomicSite ) {
			return null;
		}

		const adminUrl =
			this.props.isJetpack && ! this.props.isAtomicSite && ! this.props.isVip
				? formatUrl( {
						...parseUrl( site.options.admin_url ),
						query: { page: 'jetpack' },
						hash: '/my-plan',
				  } )
				: site.options.admin_url;

		/* eslint-disable wpcalypso/jsx-classname-namespace*/
		return (
			<li className="wp-admin">
				<a
					onClick={ this.trackWpadminClick }
					href={ adminUrl }
					target="_blank"
					rel="noopener noreferrer"
				>
					<Gridicon icon="my-sites" size={ 24 } />
					<span className="menu-link-text">{ this.props.translate( 'WP Admin' ) }</span>
					<Gridicon icon="external" size={ 24 } />
				</a>
			</li>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace*/
	}

	// Check for cases where WP Admin links should appear, where we need support for legacy reasons (VIP, older users, testing).
	useWPAdminFlows() {
		const { isAtomicSite, isJetpack, isVip } = this.props;
		const currentUser = this.props.currentUser;
		const userRegisteredDate = new Date( currentUser.date );
		const cutOffDate = new Date( '2015-09-07' );

		// VIP sites should always show a WP Admin link regardless of the current user.
		if ( isVip ) {
			return true;
		}

		// Jetpack (not Atomic) sites should always show a WP Admin
		if ( isJetpack && ! isAtomicSite ) {
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

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Button
				borderless
				className="my-sites-sidebar__add-new-site"
				href={ this.getAddNewSiteUrl() }
				onClick={ this.focusContent }
			>
				<Gridicon icon="add-outline" /> { this.props.translate( 'Add New Site' ) }
			</Button>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	trackDomainSettingsClick = () => {
		this.trackMenuItemClick( 'domain_settings' );
		this.onNavigate();
	};

	shouldShowStreamlinedNavDrawer() {
		return isEnabled( 'ui/streamlined-nav-drawer' );
	}

	renderSidebarMenus() {
		if ( this.props.isDomainOnly ) {
			return (
				<SidebarMenu>
					<ul>
						<SidebarItem
							selected={ itemLinkMatches( '/domains', this.props.path ) }
							icon="cog"
							label={ this.props.translate( 'Settings' ) }
							link={ '/domains/manage' + this.props.siteSuffix }
							onNavigate={ this.trackDomainSettingsClick }
							tipTarget="settings"
						/>
					</ul>
				</SidebarMenu>
			);
		}

		const manage = !! this.manage(),
			configuration =
				!! this.marketing() ||
				!! this.users() ||
				!! this.siteSettings() ||
				!! this.plugins() ||
				!! this.upgrades();

		if ( this.shouldShowStreamlinedNavDrawer() ) {
			return this.renderStreamlinedSidebarMenus( manage, configuration );
		}

		return (
			<div>
				<SidebarMenu>
					<ul>
						{ this.preview() }
						{ this.stats() }
						{ this.activity() }
						{ this.plan() }
						{ this.store() }
					</ul>
				</SidebarMenu>

				{ manage ? (
					<SidebarMenu>
						<SidebarHeading>{ this.props.translate( 'Manage' ) }</SidebarHeading>
						{ this.manage() }
					</SidebarMenu>
				) : null }

				{ this.themes() ? (
					<SidebarMenu>
						<SidebarHeading>{ this.props.translate( 'Personalize' ) }</SidebarHeading>
						<ul>{ this.themes() }</ul>
					</SidebarMenu>
				) : null }

				{ configuration ? (
					<SidebarMenu>
						<SidebarHeading>{ this.props.translate( 'Configure' ) }</SidebarHeading>
						<ul>
							{ this.marketing() }
							{ this.earn() }
							{ this.users() }
							{ this.plugins() }
							{ this.upgrades() }
							{ this.siteSettings() }
							{ this.wpAdmin() }
						</ul>
					</SidebarMenu>
				) : null }
			</div>
		);
	}

	renderStreamlinedSidebarMenus( manage, configuration ) {
		return (
			<div className="sidebar__menu-wrapper">
				<SidebarMenu>
					<ul>
						{ this.stats() }
						{ this.plan() }
						{ this.store() }
					</ul>
				</SidebarMenu>

				{ manage ? (
					<ExpandableSidebarMenu
						onClick={ this.props.toggleMySitesSidebarSiteMenu }
						expanded={ this.props.isSiteOpen }
						title={ this.props.translate( 'Site' ) }
						materialIcon="edit"
					>
						{ this.site() }
					</ExpandableSidebarMenu>
				) : null }

				{ this.design() ? (
					<ExpandableSidebarMenu
						onClick={ this.props.toggleMySitesSidebarDesignMenu }
						expanded={ this.props.isDesignOpen }
						title={ this.props.translate( 'Design' ) }
						materialIcon="gesture"
					>
						{ this.design() }
					</ExpandableSidebarMenu>
				) : null }

				<ExpandableSidebarMenu
					onClick={ this.props.toggleMySitesSidebarToolsMenu }
					expanded={ this.props.isToolsOpen }
					title={ this.props.translate( 'Tools' ) }
					materialIcon="build"
				>
					{ this.tools() }
					{ this.marketing() }
					{ this.earn() }
					{ this.activity() }
				</ExpandableSidebarMenu>

				{ configuration ? (
					<ExpandableSidebarMenu
						onClick={ this.props.toggleMySitesSidebarManageMenu }
						expanded={ this.props.isManageOpen }
						title={ this.props.translate( 'Manage' ) }
						materialIcon="settings"
					>
						<ul>
							{ this.upgrades() }
							{ this.users() }
							{ this.siteSettings() }
						</ul>
					</ExpandableSidebarMenu>
				) : null }

				{ this.wpAdmin() ? (
					<SidebarMenu className="sidebar__wp-admin">
						<ul>{ this.wpAdmin() }</ul>
					</SidebarMenu>
				) : null }
			</div>
		);
	}

	render() {
		let className;

		if ( this.shouldShowStreamlinedNavDrawer() ) {
			className = 'sidebar__streamlined-nav-drawer';
		}

		return (
			<Sidebar className={ className }>
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

	const isSiteOpen = isSiteMenuOpen( state );
	const isDesignOpen = isDesignMenuOpen( state );
	const isToolsOpen = isToolsMenuOpen( state );
	const isManageOpen = isManageMenuOpen( state );

	const isSharingEnabledOnJetpackSite =
		isJetpackModuleActive( state, siteId, 'publicize' ) ||
		( isJetpackModuleActive( state, siteId, 'sharedaddy' ) &&
			! isJetpackMinimumVersion( state, siteId, '3.4-dev' ) );

	const transferStatus = getAutomatedTransferStatus( state, siteId );
	const hasSitePendingAT = hasSitePendingAutomatedTransfer( state, siteId );

	return {
		canManagePlugins: canCurrentUserManagePlugins( state ),
		canUserEditThemeOptions: canCurrentUser( state, siteId, 'edit_theme_options' ),
		canUserListUsers: canCurrentUser( state, siteId, 'list_users' ),
		canUserViewActivity: canCurrentUser( state, siteId, 'manage_options' ),
		canUserManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
		canUserPublishPosts: canCurrentUser( state, siteId, 'publish_posts' ),
		canUserViewStats: canCurrentUser( state, siteId, 'view_stats' ),
		canUserUseStore: canCurrentUserUseStore( state, siteId ),
		canUserUseAds: canCurrentUserUseAds( state, siteId ),
		canUserUpgradeSite: canCurrentUserUpgradeSite( state, siteId ),
		currentUser,
		customizeUrl: getCustomizerUrl( state, selectedSiteId ),
		hasJetpackSites: hasJetpackSites( state ),
		isDomainOnly: isDomainOnlySite( state, selectedSiteId ),
		isJetpack,
		isSiteOpen,
		isDesignOpen,
		isToolsOpen,
		isManageOpen,
		isPreviewable: isSitePreviewable( state, selectedSiteId ),
		isSharingEnabledOnJetpackSite,
		isAtomicSite: !! isSiteAutomatedTransfer( state, selectedSiteId ),
		isVip: isVipSite( state, selectedSiteId ),
		siteId,
		site,
		siteSuffix: site ? '/' + site.slug : '',
		siteHasBackgroundTransfer: hasSitePendingAT && transferStatus !== transferStates.ERROR,
	};
}

export default connect(
	mapStateToProps,
	{
		recordGoogleEvent,
		recordTracksEvent,
		setLayoutFocus,
		setNextLayoutFocus,
		toggleMySitesSidebarSiteMenu,
		toggleMySitesSidebarDesignMenu,
		toggleMySitesSidebarToolsMenu,
		toggleMySitesSidebarManageMenu,
	}
)( localize( MySitesSidebar ) );
