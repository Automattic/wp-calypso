/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'calypso/components/gridicon';
import { memoize } from 'lodash';
import { ProgressBar } from '@automattic/components';

/**
 * Internal dependencies
 */
import { isEnabled } from '@automattic/calypso-config';
import CurrentSite from 'calypso/my-sites/current-site';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import ExternalLink from 'calypso/components/external-link';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Sidebar from 'calypso/layout/sidebar';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';
import SiteMenu from './site-menu';
import StatsSparkline from 'calypso/blocks/stats-sparkline';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QuerySiteChecklist from 'calypso/components/data/query-site-checklist';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QueryScanState from 'calypso/components/data/query-jetpack-scan';
import ToolsMenu from './tools-menu';
import { isP2PlusPlan, isBusiness, isEcommerce } from '@automattic/calypso-products';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isSidebarSectionOpen } from 'calypso/state/my-sites/sidebar/selectors';
import { setNextLayoutFocus, setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import hasJetpackSites from 'calypso/state/selectors/has-jetpack-sites';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isEligibleForDotcomChecklist from 'calypso/state/selectors/is-eligible-for-dotcom-checklist';
import isSiteChecklistComplete from 'calypso/state/selectors/is-site-checklist-complete';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteMigrationInProgress from 'calypso/state/selectors/is-site-migration-in-progress';
import isSiteMigrationActiveRoute from 'calypso/state/selectors/is-site-migration-active-route';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getScanState from 'calypso/state/selectors/get-site-scan-state';
import isJetpackCloudEligible from 'calypso/state/selectors/is-jetpack-cloud-eligible';
import {
	getCustomizerUrl,
	getSite,
	isJetpackSite,
	canCurrentUserUseEarn,
	getSiteOption,
	canCurrentUserUseWooCommerceCoreStore,
	getSiteWoocommerceUrl,
} from 'calypso/state/sites/selectors';
import getSiteChecklist from 'calypso/state/selectors/get-site-checklist';
import getSiteTaskList from 'calypso/state/selectors/get-site-task-list';
import canCurrentUserUseCustomerHome from 'calypso/state/sites/selectors/can-current-user-use-customer-home';
import canCurrentUserManagePlugins from 'calypso/state/selectors/can-current-user-manage-plugins';
import { getStatsPathForTab } from 'calypso/lib/route';
import { itemLinkMatches } from './utils';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	collapseMySitesSidebarSection as collapseSection,
	expandMySitesSidebarSection as expandSection,
	toggleMySitesSidebarSection as toggleSection,
} from 'calypso/state/my-sites/sidebar/actions';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import isSiteUsingFullSiteEditing from 'calypso/state/selectors/is-site-using-full-site-editing';
import isSiteUsingCoreSiteEditor from 'calypso/state/selectors/is-site-using-core-site-editor';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import {
	SIDEBAR_SECTION_DESIGN,
	SIDEBAR_SECTION_JETPACK,
	SIDEBAR_SECTION_MANAGE,
	SIDEBAR_SECTION_SITE,
	SIDEBAR_SECTION_UPGRADES,
	SIDEBAR_SECTION_TOOLS,
} from './constants';
import canSiteViewAtomicHosting from 'calypso/state/selectors/can-site-view-atomic-hosting';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import getOnboardingUrl from 'calypso/state/selectors/get-onboarding-url';
import { isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import { isUnderEmailManagementAll } from 'calypso/my-sites/email/paths';
import JetpackSidebarMenuItems from 'calypso/components/jetpack/sidebar/menu-items/calypso';
import InfoPopover from 'calypso/components/info-popover';
import getSitePlanSlug from 'calypso/state/sites/selectors/get-site-plan-slug';
import { getUrlParts, getUrlFromParts } from '@automattic/calypso-url';

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
		sitePlanSlug: PropTypes.string,
	};

	collapseManageSection = () => this.props.collapseSection( SIDEBAR_SECTION_MANAGE );

	expandUpgradesSection = () => this.props.expandSection( SIDEBAR_SECTION_UPGRADES );

	expandSiteSection = () => this.props.expandSection( SIDEBAR_SECTION_SITE );

	expandDesignSection = () => this.props.expandSection( SIDEBAR_SECTION_DESIGN );

	expandToolsSection = () => this.props.expandSection( SIDEBAR_SECTION_TOOLS );

	expandManageSection = () => this.props.expandSection( SIDEBAR_SECTION_MANAGE );

	expandJetpackSection = () => this.props.expandSection( SIDEBAR_SECTION_JETPACK );

	toggleSection = memoize( ( id ) => () => this.props.toggleSection( id ) );

	expandDomains = () => {
		this.collapseManageSection();
		this.expandUpgradesSection();
	};

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

	cloud() {
		const {
			scanState,
			rewindState,
			isCloudEligible,
			site,
			shouldRenderJetpackSection,
		} = this.props;
		if (
			! site ||
			! isCloudEligible ||
			! scanState ||
			! rewindState ||
			'uninitialized' === rewindState.state ||
			// Sections are already present in the Jetpack menu
			shouldRenderJetpackSection
		) {
			return null;
		}

		const hasScan = 'unavailable' !== scanState.state;
		const hasBackup = 'unavailable' !== rewindState.state;
		if ( ! hasScan && ! hasBackup ) {
			return null;
		}
		const sidebarItems = [];
		if ( hasBackup ) {
			sidebarItems.push(
				<SidebarItem
					key="backup"
					tipTarget="backup"
					label="Backup"
					link={ `https://cloud.jetpack.com/backup/${ site.slug }` }
					onNavigate={ () => this.trackMenuItemClick( 'backup' ) }
				/>
			);
		}
		if ( hasScan ) {
			sidebarItems.push(
				<SidebarItem
					key="scan"
					tipTarget="scan"
					label="Scan"
					link={ `https://cloud.jetpack.com/scan/${ site.slug }` }
					onNavigate={ () => this.trackMenuItemClick( 'scan' ) }
				/>
			);
		}

		return sidebarItems;
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
				tipTarget="stats"
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
		this.trackMenuItemClick( 'customer-home' );
		this.onNavigate();
	};

	customerHome() {
		const {
			canUserUseCustomerHome,
			hideChecklistProgress,
			path,
			siteSuffix,
			siteId,
			siteTasklist,
			translate,
		} = this.props;

		if ( ! siteId || ! canUserUseCustomerHome ) {
			return null;
		}

		let label = translate( 'My Home' );

		if ( isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
			label = translate( 'Home' );
		}

		const { completed, total } = siteTasklist.getCompletionStatus();

		return (
			<SidebarItem
				materialIcon="home"
				tipTarget="myhome"
				onNavigate={ this.trackCustomerHomeClick }
				label={ label }
				selected={ itemLinkMatches( [ '/home' ], path ) }
				link={ '/home' + siteSuffix }
			>
				{ ! hideChecklistProgress && (
					<div className="sidebar__checklist-progress">
						<p className="sidebar__checklist-progress-text">
							{ translate( 'Setup', { context: 'verb' } ) }
						</p>
						<ProgressBar value={ completed } total={ total } />
					</div>
				) }
			</SidebarItem>
		);
	}

	trackActivityClick = () => {
		this.trackMenuItemClick( 'activity' );
		this.onNavigate();
	};

	activity() {
		const {
			siteId,
			canUserViewActivity,
			shouldRenderJetpackSection,
			path,
			translate,
			siteSuffix,
		} = this.props;

		if ( ! siteId ) {
			return null;
		}

		if ( ! canUserViewActivity ) {
			return null;
		}

		if ( isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
			return null;
		}

		// When the new Jetpack section is active,
		// Activity Log goes there instead of here
		if ( shouldRenderJetpackSection ) {
			return null;
		}

		let activityLink = '/activity-log' + siteSuffix;
		let activityLabel = translate( 'Activity' );

		if ( this.props.isJetpack && isEnabled( 'manage/themes-jetpack' ) ) {
			activityLink += '?group=rewind';
			activityLabel = translate( 'Activity & Backups' );
		}

		return (
			<SidebarItem
				tipTarget="activity"
				label={ activityLabel }
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

		if ( isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
			return null;
		}

		if ( ! site ) {
			return null;
		}

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

	trackMigrateClick = () => {
		this.trackMenuItemClick( 'migrate' );
		this.onNavigate();
	};

	trackCustomizeClick = () => {
		this.trackMenuItemClick( 'customize' );
		this.onNavigate();
	};

	trackPurchasesClick = () => {
		this.trackMenuItemClick( 'purchases' );
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

	jetpack() {
		const { canUserManageOptions, isJetpackSectionOpen, path, sitePlanSlug } = this.props;

		if (
			this.props.isSiteWPForTeams &&
			( ! isEnabled( 'p2/p2-plus' ) ||
				( isEnabled( 'p2/p2-plus' ) && ! isP2PlusPlan( sitePlanSlug ) ) )
		) {
			return null;
		}

		if ( ! canUserManageOptions ) {
			return null;
		}

		return (
			<ExpandableSidebarMenu
				expanded={ isJetpackSectionOpen }
				customIcon={ <JetpackLogo size={ 24 } className="sidebar__menu-icon" /> }
				onClick={ this.toggleSection( SIDEBAR_SECTION_JETPACK ) }
				title="Jetpack"
			>
				<JetpackSidebarMenuItems
					path={ path }
					showIcons={ false }
					expandSection={ this.expandJetpackSection }
				/>
			</ExpandableSidebarMenu>
		);
	}

	customize() {
		const { showCustomizerLink, translate, path } = this.props;

		if ( ! showCustomizerLink ) {
			return null;
		}

		return (
			<SidebarItem
				label={ translate( 'Customize' ) }
				selected={ itemLinkMatches( '/customize', path ) }
				link={ this.props.customizeUrl }
				onNavigate={ this.trackCustomizeClick }
				preloadSectionName="customize"
				materialIcon="gesture"
			/>
		);
	}

	design() {
		const {
			path,
			site,
			translate,
			canUserEditThemeOptions,
			showCustomizerLink,
			showSiteEditor,
		} = this.props;
		const jetpackEnabled = isEnabled( 'manage/themes-jetpack' );
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
			<Fragment>
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
				{ showSiteEditor && (
					<SidebarItem
						label={ translate( 'Site Editor (beta)' ) }
						link={ this.props.siteEditorUrl }
						preloadSectionName="site editor"
						forceInternalLink
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
			</Fragment>
		);
	}

	trackDomainsClick = () => {
		this.trackMenuItemClick( 'domains' );
		this.onNavigate();
	};

	domains() {
		const { path, translate, canUserManageOptions } = this.props;

		if ( isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
			return null;
		}

		let domainsLink = '/domains/manage';

		if ( this.props.siteSuffix ) {
			domainsLink += this.props.siteSuffix;
		}

		if ( this.props.siteId && ! canUserManageOptions ) {
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
				expandSection={ this.expandDomains }
			/>
		);
	}

	upgradesMenu() {
		const { canUserManageOptions, site, isWpMobile } = this.props;

		if ( ! site ) {
			return null;
		}

		if (
			isEnabled( 'signup/wpforteams' ) &&
			this.props.isSiteWPForTeams &&
			! isEnabled( 'p2/p2-plus' )
		) {
			return null;
		}

		if ( ! canUserManageOptions ) {
			return null;
		}

		// Hide "Plans" because the App/Play Stores reject apps that present non In-App Purchase flows, even in a WebView
		if ( isWpMobile ) {
			return null;
		}

		return (
			<ExpandableSidebarMenu
				onClick={ this.toggleSection( SIDEBAR_SECTION_UPGRADES ) }
				expanded={ this.props.isUpgradesSectionOpen }
				title={ this.props.translate( 'Upgrades', { context: 'noun' } ) }
				customIcon={ <Gridicon icon="star" className="sidebar__menu-icon" size={ 24 } /> }
			>
				{ this.plans() }
				{ this.domains() }
				<SidebarItem
					label={ this.props.translate( 'Purchases' ) }
					tipTarget="purchases"
					selected={ itemLinkMatches( '/purchases', this.props.path ) }
					link={
						this.props.site ? '/purchases/subscriptions/' + this.props.site.slug : '/me/purchases'
					}
					onNavigate={ this.trackPurchasesClick }
					preloadSectionName="site-purchases"
					forceInternalLink
					expandSection={ this.expandUpgradesSection }
				/>
			</ExpandableSidebarMenu>
		);
	}

	plans() {
		const {
			canUserManageOptions,
			isAtomicSite,
			isJetpack,
			isVip,
			path,
			site,
			siteSuffix,
			translate,
		} = this.props;

		if ( ! site ) {
			return null;
		}

		if (
			isEnabled( 'signup/wpforteams' ) &&
			this.props.isSiteWPForTeams &&
			! isEnabled( 'p2/p2-plus' )
		) {
			return null;
		}

		if ( ! canUserManageOptions ) {
			return null;
		}

		// Hide the plan name only for Jetpack sites that are not Atomic or VIP.
		const displayPlanName = ! isJetpack || isAtomicSite || isVip;

		return (
			<SidebarItem
				label={ translate( 'Plans', { context: 'noun' } ) }
				tipTarget="plans"
				selected={ itemLinkMatches( '/plans', path ) }
				link={ '/plans' + siteSuffix }
				onNavigate={ this.trackPlanClick }
				preloadSectionName="plans"
				forceInternalLink
				expandSection={ this.expandUpgradesSection }
			>
				{ displayPlanName && (
					<span className="sidebar__menu-link-secondary-text">
						{ site?.plan.product_name_short }
					</span>
				) }
			</SidebarItem>
		);
	}

	trackWooCommerceNavItemClick = ( menuItemName, experience, plan ) => {
		// Log the general Tracks event
		this.trackMenuItemClick( menuItemName );

		// Log a single Tracks event for Store/WooCommerce nav item clicks,
		// so that easy comparisons can be made between them.
		this.props.recordTracksEvent( 'calypso_woocommerce_nav_item_click', {
			nav_item: menuItemName,
			experience,
			plan,
			nav_item_experience_plan_combo: `${ menuItemName }__${ experience }__${ plan }`,
		} );

		// Continue to log the old individual Tracks events so that existing analysis
		// using them still function.
		if ( menuItemName === 'store' ) {
			this.props.recordTracksEvent( 'calypso_woocommerce_store_nav_item_click' );
		} else if ( menuItemName === 'woocommerce' ) {
			this.props.recordTracksEvent( 'calypso_woocommerce_store_woo_core_item_click' );
		}

		this.onNavigate();
	};

	store() {
		const {
			translate,
			site,
			siteSuffix,
			canUserUseWooCommerceCoreStore,
			isSiteWpcomStore,
		} = this.props;

		if ( ! site ) {
			return null;
		}

		let experience = 'calypso-store';
		let storeLink = '/store' + siteSuffix;
		if ( isEcommerce( site.plan ) && canUserUseWooCommerceCoreStore ) {
			// Eventually, the plan is to have the WooCommerce Core menu item labelled the same
			// for both Business and eCommerce users. But, for now, we want to continue to
			// use the "Store" label for eCommerce users because that is what they are used to.
			// So, we'll just continue to change the link here as we have been doing.
			experience = 'wpadmin-woocommerce-core';
			storeLink = site.options.admin_url + 'admin.php?page=wc-admin';
		} else {
			return null;
		}

		if ( ! isSiteWpcomStore && isBusiness( site.plan ) ) {
			return null;
		}

		const infoCopy = translate(
			'Your favorite Store functions will become part of WooCommerce menus in February. {{link}}Learn more{{/link}}.',
			{
				components: {
					link: (
						<a
							href="https://wordpress.com/support/new-woocommerce-experience-on-wordpress-dot-com/"
							rel="noreferrer"
							target="_blank"
						/>
					),
				},
			}
		);

		return (
			<SidebarItem
				label={ translate( 'Store' ) }
				link={ storeLink }
				onNavigate={ this.trackWooCommerceNavItemClick.bind(
					this,
					'store',
					experience,
					site.plan.product_slug
				) }
				materialIcon="shopping_cart"
				forceInternalLink
				className="sidebar__store"
			>
				{ isBusiness( site.plan ) && (
					<InfoPopover
						className="sidebar__store-tooltip"
						position="bottom right"
						showOnHover={ true }
					>
						{ infoCopy }
					</InfoPopover>
				) }
			</SidebarItem>
		);
	}

	woocommerce() {
		const {
			site,
			canUserUseWooCommerceCoreStore,
			siteSuffix,
			isSiteWpcomStore,
			woocommerceUrl,
		} = this.props;

		if ( ! site ) {
			return null;
		}

		if ( ! isBusiness( site.plan ) || ! canUserUseWooCommerceCoreStore ) {
			// Right now, we only use the "WooCommerce" label for Business plan sites.
			// eCommerce sites continue to use the "Store" label for now
			// (see handling in `store()` above.
			return null;
		}

		let storeLink = woocommerceUrl;
		if ( ! isSiteWpcomStore ) {
			// Navigate to installation.
			storeLink = '/woocommerce-installation' + siteSuffix;
		}

		return (
			<SidebarItem
				label="WooCommerce"
				link={ storeLink }
				onNavigate={ this.trackWooCommerceNavItemClick.bind(
					this,
					'woocommerce',
					'wpadmin-woocommerce-core',
					site.plan.product_slug
				) }
				materialIcon="shopping_cart"
			/>
		);
	}

	trackMenuItemClick = ( menuItemName ) => {
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

		if ( isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
			return null;
		}

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

	trackHostingClick = () => {
		this.trackMenuItemClick( 'hosting' );
		this.onNavigate();
	};

	hosting() {
		const { translate, path, siteSuffix, canViewAtomicHosting } = this.props;

		if ( isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
			return null;
		}

		if ( ! canViewAtomicHosting ) {
			return null;
		}

		return (
			<SidebarItem
				label={ translate( 'Hosting Configuration' ) }
				selected={ itemLinkMatches( '/hosting-config', path ) }
				link={ `/hosting-config${ siteSuffix }` }
				onNavigate={ this.trackHostingClick }
				preloadSectionName="hosting"
				expandSection={ this.expandManageSection }
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

		if ( isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
			return null;
		}

		if ( ! site?.options?.admin_url ) {
			return null;
		}

		let adminUrl = site.options.admin_url;

		if ( this.props.isJetpack && ! this.props.isAtomicSite && ! this.props.isVip ) {
			const urlParts = getUrlParts( site.options.admin_url + 'admin.php' );
			delete urlParts.search;
			try {
				adminUrl = getUrlFromParts( {
					...urlParts,
					protocol: urlParts.protocol || 'https:',
					searchParams: new URLSearchParams( { page: 'jetpack' } ),
					hash: '/my-plan',
				} ).href;
			} catch ( error ) {
				return null;
			}
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<SidebarMenu className="sidebar__wp-admin">
				<li data-tip-target="wpadmin">
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
			</SidebarMenu>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	trackWpadminClick = () => {
		this.trackMenuItemClick( 'wpadmin' );
		this.props.recordGoogleEvent( 'Sidebar', 'Clicked WP Admin' );
	};

	trackAddNewSiteClick = () => {
		this.props.recordTracksEvent( 'calypso_add_new_wordpress_click' );
		this.props.setLayoutFocus( 'content' );
	};

	addNewSite() {
		if ( this.props.currentUser.visible_site_count > 1 ) {
			return null;
		}

		return (
			<SidebarItem
				label={ this.props.translate( 'Add new site' ) }
				link={ `${ this.props.onboardingUrl }?ref=calypso-sidebar` }
				onNavigate={ this.trackAddNewSiteClick }
				icon="add-outline"
			/>
		);
	}

	trackDomainSettingsClick = () => {
		this.trackMenuItemClick( 'domain_settings' );
		this.onNavigate();
	};

	canViewAdminSections = () => {
		const { isAllSitesView, canUserManageOptions, canUserManagePlugins } = this.props;

		return (
			( ! isAllSitesView && canUserManageOptions ) ||
			( isAllSitesView && ( canUserManageOptions || canUserManagePlugins ) )
		);
	};

	renderSidebarMenus() {
		if ( this.props.isDomainOnly ) {
			return (
				<SidebarMenu>
					<SidebarItem
						selected={ itemLinkMatches( '/domains', this.props.path ) }
						label={ this.props.translate( 'Settings' ) }
						link={ '/domains/manage' + this.props.siteSuffix }
						onNavigate={ this.trackDomainSettingsClick }
						tipTarget="settings"
					/>
				</SidebarMenu>
			);
		}

		if ( this.props.isMigrationInProgress ) {
			return <SidebarMenu />;
		}

		const tools =
			!! this.cloud() ||
			!! this.tools() ||
			!! this.marketing() ||
			!! this.earn() ||
			!! this.activity();

		return (
			<div className="sidebar__menu-wrapper">
				<QuerySitePurchases siteId={ this.props.siteId } />

				<SidebarMenu>
					{ this.customerHome() }
					{ this.stats() }
					{ this.upgradesMenu() }
					{ this.store() }
					{ this.woocommerce() }
				</SidebarMenu>

				{ this.props.siteId && <QuerySiteChecklist siteId={ this.props.siteId } /> }
				<ExpandableSidebarMenu
					onClick={ this.toggleSection( SIDEBAR_SECTION_SITE ) }
					expanded={ this.props.isSiteSectionOpen }
					title={ this.props.translate( 'Site' ) }
					materialIcon="edit"
				>
					{ this.site() }
				</ExpandableSidebarMenu>

				{ this.props.shouldRenderJetpackSection && this.jetpack() }

				{ ! ( isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) && this.design() ? (
					<ExpandableSidebarMenu
						onClick={ this.toggleSection( SIDEBAR_SECTION_DESIGN ) }
						expanded={ this.props.isDesignSectionOpen }
						title={ this.props.translate( 'Design' ) }
						materialIcon="gesture"
					>
						{ this.design() }
					</ExpandableSidebarMenu>
				) : null }

				{ isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams && this.customize() }

				<QueryRewindState siteId={ this.props.siteId } />
				<QueryScanState siteId={ this.props.siteId } />

				{ tools && this.canViewAdminSections() && (
					<ExpandableSidebarMenu
						onClick={ this.toggleSection( SIDEBAR_SECTION_TOOLS ) }
						expanded={ this.props.isToolsSectionOpen }
						title={ this.props.translate( 'Tools' ) }
						materialIcon="build"
					>
						{ this.cloud() }
						{ this.tools() }
						{ this.marketing() }
						{ this.earn() }
						{ this.activity() }
					</ExpandableSidebarMenu>
				) }

				{ this.canViewAdminSections() && (
					<ExpandableSidebarMenu
						onClick={ this.toggleSection( SIDEBAR_SECTION_MANAGE ) }
						expanded={ this.props.isManageSectionOpen }
						title={ this.props.translate( 'Manage' ) }
						materialIcon="settings"
					>
						{ this.hosting() }
						{ this.domains() }
						{ this.users() }
						{ this.siteSettings() }
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
					<CurrentSite forceAllSitesView={ this.props.forceAllSitesView } />
					{ this.renderSidebarMenus() }
				</SidebarRegion>
				<SidebarFooter>{ this.addNewSite() }</SidebarFooter>
			</Sidebar>
		);
	}
}

function mapStateToProps( state ) {
	const currentUser = getCurrentUser( state );
	const currentRoute = getCurrentRoute( state );

	const isAllDomainsView =
		isUnderDomainManagementAll( currentRoute ) || isUnderEmailManagementAll( currentRoute );

	const selectedSiteId = isAllDomainsView ? null : getSelectedSiteId( state );
	const isSingleSite = !! selectedSiteId || currentUser.site_count === 1;
	const siteId = isAllDomainsView
		? null
		: selectedSiteId || ( isSingleSite && getPrimarySiteId( state ) ) || null;
	const site = getSite( state, siteId );

	const isJetpack = isJetpackSite( state, siteId );

	const isUpgradesSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_UPGRADES );
	const isSiteSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_SITE );
	const isDesignSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_DESIGN );
	const isToolsSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_TOOLS );
	const isManageSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_MANAGE );
	const isJetpackSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_JETPACK );

	const isMigrationInProgress =
		isSiteMigrationInProgress( state, selectedSiteId ) || isSiteMigrationActiveRoute( state );

	return {
		canUserEditThemeOptions: canCurrentUser( state, siteId, 'edit_theme_options' ),
		canUserListUsers: canCurrentUser( state, siteId, 'list_users' ),
		canUserViewActivity: canCurrentUser( state, siteId, 'manage_options' ),
		canUserManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
		canUserPublishPosts: canCurrentUser( state, siteId, 'publish_posts' ),
		canUserViewStats: canCurrentUser( state, siteId, 'view_stats' ),
		canUserManagePlugins: canCurrentUserManagePlugins( state ),
		canUserUseWooCommerceCoreStore: canCurrentUserUseWooCommerceCoreStore( state, siteId ),
		canUserUseEarn: canCurrentUserUseEarn( state, siteId ),
		canUserUseCustomerHome: canCurrentUserUseCustomerHome( state, siteId ),
		currentUser,
		customizeUrl: getCustomizerUrl( state, selectedSiteId ),
		forceAllSitesView: isAllDomainsView,
		hasJetpackSites: hasJetpackSites( state ),
		isDomainOnly: isDomainOnlySite( state, selectedSiteId ),
		isJetpack,
		shouldRenderJetpackSection: isJetpackSectionEnabledForSite( state, selectedSiteId ),
		isUpgradesSectionOpen,
		isSiteSectionOpen,
		isDesignSectionOpen,
		isToolsSectionOpen,
		isManageSectionOpen,
		isJetpackSectionOpen,
		isAtomicSite: !! isSiteAutomatedTransfer( state, selectedSiteId ),
		isMigrationInProgress,
		isVip: isVipSite( state, selectedSiteId ),
		showCustomizerLink:
			! (
				isSiteUsingFullSiteEditing( state, selectedSiteId ) ||
				isSiteUsingCoreSiteEditor( state, selectedSiteId )
			) && siteId,
		showSiteEditor: isSiteUsingCoreSiteEditor( state, selectedSiteId ),
		siteEditorUrl: getSiteEditorUrl( state, selectedSiteId ),
		siteId,
		site,
		siteSuffix: site ? '/' + site.slug : '',
		canViewAtomicHosting: ! isAllDomainsView && canSiteViewAtomicHosting( state ),
		isSiteWPForTeams: isSiteWPForTeams( state, siteId ),
		siteTasklist: getSiteTaskList( state, siteId ),
		hideChecklistProgress:
			isSiteChecklistComplete( state, siteId ) ||
			! getSiteChecklist( state, siteId ) ||
			! isEligibleForDotcomChecklist( state, siteId ) ||
			isEnabled( 'desktop' ),
		scanState: getScanState( state, siteId ),
		rewindState: getRewindState( state, siteId ),
		isCloudEligible: isJetpackCloudEligible( state, siteId ),
		isAllSitesView: isAllDomainsView || getSelectedSiteId( state ) === null,
		isWpMobile: isWpMobileApp(), // This doesn't rely on state, but we inject it here for future testability
		sitePlanSlug: getSitePlanSlug( state, siteId ),
		onboardingUrl: getOnboardingUrl( state ),
		isSiteWpcomStore: getSiteOption( state, siteId, 'is_wpcom_store' ), // 'is_automated_transfer' && 'woocommerce_is_active'
		woocommerceUrl: getSiteWoocommerceUrl( state, siteId ),
	};
}

export default connect( mapStateToProps, {
	recordGoogleEvent,
	recordTracksEvent,
	setLayoutFocus,
	setNextLayoutFocus,
	collapseSection,
	expandSection,
	toggleSection,
} )( localize( MySitesSidebar ) );
