/** @format */
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

/**
 * Internal dependencies
 */
import Button from 'components/button';
import config from 'config';
import CurrentSite from 'my-sites/current-site';
import ManageMenu from './manage-menu';
import Sidebar from 'layout/sidebar';
import SidebarButton from 'layout/sidebar/button';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import StatsSparkline from 'blocks/stats-sparkline';
import JetpackLogo from 'components/jetpack-logo';
import { isFreeTrial, isPersonal, isPremium, isBusiness } from 'lib/products-values';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { setNextLayoutFocus, setLayoutFocus } from 'state/ui/layout-focus/actions';
import {
	canCurrentUser,
	canCurrentUserManagePlugins,
	getPrimarySiteId,
	hasJetpackSites,
	isDomainOnlySite,
	isSiteAutomatedTransfer,
	hasSitePendingAutomatedTransfer,
} from 'state/selectors';
import {
	getCustomizerUrl,
	getSite,
	isJetpackMinimumVersion,
	isJetpackModuleActive,
	isJetpackSite,
	isSitePreviewable,
} from 'state/sites/selectors';
import { getStatsPathForTab } from 'lib/route';
import { getAutomatedTransferStatus } from 'state/automated-transfer/selectors';
import { transferStates } from 'state/automated-transfer/constants';
import { itemLinkMatches } from './utils';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

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
		isSiteAutomatedTransfer: PropTypes.bool,
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
		return (
			<SidebarItem
				tipTarget="menus"
				label={ translate( 'Stats' ) }
				className="stats"
				selected={ itemLinkMatches( [ '/stats', '/store/stats' ], path ) }
				link={ statsLink }
				onNavigate={ this.trackStatsClick }
				icon="stats-alt"
			>
				<a href={ statsLink }>
					<StatsSparkline className="sidebar__sparkline" siteId={ siteId } />
				</a>
			</SidebarItem>
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

	trackAdsClick = () => {
		this.trackMenuItemClick( 'ads' );
		this.onNavigate();
	};

	ads() {
		const { path, site, canUserManageOptions } = this.props;
		const adsLink = '/ads/earnings' + this.props.siteSuffix;
		const canManageAds = site && site.options.wordads && canUserManageOptions;

		return (
			canManageAds && (
				<SidebarItem
					label={ this.props.isJetpack ? 'Ads' : 'WordAds' }
					selected={ itemLinkMatches( '/ads', path ) }
					link={ adsLink }
					onNavigate={ this.trackAdsClick }
					icon="speaker"
					tipTarget="wordads"
				/>
			)
		);
	}

	trackThemesClick = () => {
		this.trackMenuItemClick( 'themes' );
		this.onNavigate();
	};

	themes() {
		const { path, site, translate, canUserEditThemeOptions } = this.props,
			jetpackEnabled = config.isEnabled( 'manage/themes-jetpack' );
		let themesLink;

		if ( site && ! canUserEditThemeOptions ) {
			return null;
		}

		if ( ! config.isEnabled( 'manage/themes' ) ) {
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
				label={ translate( 'Themes' ) }
				tipTarget="themes"
				selected={ itemLinkMatches( '/themes', path ) }
				link={ themesLink }
				onNavigate={ this.trackThemesClick }
				icon="themes"
				preloadSectionName="themes"
			>
				<SidebarButton
					onClick={ this.trackSidebarButtonClick( 'customize' ) }
					href={ this.props.customizeUrl }
					preloadSectionName="customize"
				>
					{ this.props.translate( 'Customize' ) }
				</SidebarButton>
			</SidebarItem>
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
		const pluginsLink = '/plugins' + this.props.siteSuffix;
		const managePluginsLink = '/plugins/manage' + this.props.siteSuffix;

		// checks for manage plugins capability across all sites
		if ( ! this.props.canManagePlugins ) {
			return null;
		}

		// if selectedSite and cannot manage, skip plugins section
		if ( this.props.siteId && ! this.props.canUserManageOptions ) {
			return null;
		}

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

		if ( this.props.isJetpack && ! this.props.isSiteAutomatedTransfer ) {
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
		if ( isPersonal( site.plan ) || isPremium( site.plan ) || isBusiness( site.plan ) ) {
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

		return (
			<li className={ linkClass } data-tip-target={ tipTarget }>
				<a onClick={ this.trackPlanClick } href={ planLink }>
					<JetpackLogo size={ 24 } />
					<span className="menu-link-text">{ translate( 'Plan', { context: 'noun' } ) }</span>
					<span className="sidebar__menu-link-secondary-text">{ planName }</span>
				</a>
			</li>
		);
	}

	trackStoreClick = () => {
		this.trackMenuItemClick( 'store' );
		this.props.recordTracksEvent( 'calypso_woocommerce_store_nav_item_click' );
		this.onNavigate();
	};

	store() {
		const {
			canUserManageOptions,
			site,
			siteSuffix,
			translate,
			siteHasBackgroundTransfer,
		} = this.props;

		if ( ! config.isEnabled( 'woocommerce/extension-dashboard' ) || ! site ) {
			return null;
		}

		const isPermittedSite = canUserManageOptions && this.props.isSiteAutomatedTransfer;

		if (
			! isPermittedSite &&
			! ( config.isEnabled( 'signup/atomic-store-flow' ) && siteHasBackgroundTransfer )
		) {
			return null;
		}

		const storeLink = '/store' + siteSuffix;

		return (
			<SidebarItem
				label={ translate( 'Store' ) }
				link={ storeLink }
				onNavigate={ this.trackStoreClick }
				icon="cart"
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

	trackSharingClick = () => {
		this.trackMenuItemClick( 'sharing' );
		this.onNavigate();
	};

	sharing() {
		const { isJetpack, isSharingEnabledOnJetpackSite, path, site } = this.props;
		const sharingLink = '/sharing' + this.props.siteSuffix;

		if ( site && ! this.props.canUserPublishPosts ) {
			return null;
		}

		if ( ! this.props.siteId ) {
			return null;
		}

		if ( isJetpack && ! isSharingEnabledOnJetpackSite ) {
			return null;
		}

		return (
			<SidebarItem
				label={ this.props.translate( 'Sharing' ) }
				selected={ itemLinkMatches( '/sharing', path ) }
				link={ sharingLink }
				onNavigate={ this.trackSharingClick }
				icon="share"
				preloadSectionName="sharing"
				tipTarget="sharing"
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
				selected={ itemLinkMatches( '/settings', path ) }
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

		// Ignore Jetpack sites as they've opted into this interface.
		if ( this.props.isJetpack && ! this.props.isSiteAutomatedTransfer ) {
			return null;
		}

		if ( ! this.useWPAdminFlows() && ! this.props.isSiteAutomatedTransfer ) {
			return null;
		}

		return (
			<li className="wp-admin">
				<a
					onClick={ this.trackWpadminClick }
					href={ site.options.admin_url }
					target="_blank"
					rel="noopener noreferrer"
				>
					<Gridicon icon="my-sites" size={ 24 } />
					<span className="menu-link-text">{ this.props.translate( 'WP Admin' ) }</span>
					<Gridicon icon="external" size={ 24 } />
				</a>
			</li>
		);
	}

	// Check for cases where WP Admin links should appear, where we need support for legacy reasons (VIP, older users, testing).
	useWPAdminFlows() {
		const { site } = this.props;
		const currentUser = this.props.currentUser;
		const userRegisteredDate = new Date( currentUser.date );
		const cutOffDate = new Date( '2015-09-07' );

		// VIP sites should always show a WP Admin link regardless of the current user.
		if ( site && site.is_vip ) {
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
			<Button
				borderless
				className="my-sites-sidebar__add-new-site"
				href={ this.getAddNewSiteUrl() }
				onClick={ this.focusContent }
			>
				<Gridicon icon="add-outline" /> { this.props.translate( 'Add New Site' ) }
			</Button>
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
				!! this.sharing() ||
				!! this.users() ||
				!! this.siteSettings() ||
				!! this.plugins() ||
				!! this.upgrades();

		return (
			<div>
				<SidebarMenu>
					<ul>
						{ this.preview() }
						{ this.stats() }
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

				{ !! this.themes() ? (
					<SidebarMenu>
						<SidebarHeading>{ this.props.translate( 'Personalize' ) }</SidebarHeading>
						<ul>{ this.themes() }</ul>
					</SidebarMenu>
				) : null }

				{ configuration ? (
					<SidebarMenu>
						<SidebarHeading>{ this.props.translate( 'Configure' ) }</SidebarHeading>
						<ul>
							{ this.ads() }
							{ this.sharing() }
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

	render() {
		return (
			<Sidebar>
				<SidebarRegion>
					<CurrentSite allSitesPath={ this.props.allSitesPath } />
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
		canUserManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
		canUserPublishPosts: canCurrentUser( state, siteId, 'publish_posts' ),
		canUserViewStats: canCurrentUser( state, siteId, 'view_stats' ),
		currentUser,
		customizeUrl: getCustomizerUrl( state, selectedSiteId ),
		hasJetpackSites: hasJetpackSites( state ),
		isDomainOnly: isDomainOnlySite( state, selectedSiteId ),
		isJetpack,
		isPreviewable: isSitePreviewable( state, selectedSiteId ),
		isSharingEnabledOnJetpackSite,
		isSiteAutomatedTransfer: !! isSiteAutomatedTransfer( state, selectedSiteId ),
		siteId,
		site,
		siteSuffix: site ? '/' + site.slug : '',
		siteHasBackgroundTransfer: hasSitePendingAT && transferStatus !== transferStates.ERROR,
	};
}

export default connect( mapStateToProps, {
	recordGoogleEvent,
	recordTracksEvent,
	setLayoutFocus,
	setNextLayoutFocus,
} )( localize( MySitesSidebar ) );
