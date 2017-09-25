/**
 * External dependencies
 */
import classNames from 'classnames';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { includes } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';
import config from 'config';
import CurrentSite from 'my-sites/current-site';
import productsValues from 'lib/products-values';
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
import { isPersonal, isPremium, isBusiness } from 'lib/products-values';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { setNextLayoutFocus, setLayoutFocus } from 'state/ui/layout-focus/actions';
import {
	canCurrentUser,
	canCurrentUserManagePlugins,
	getPrimarySiteId,
	hasJetpackSites,
	isDomainOnlySite,
	isSiteAutomatedTransfer
} from 'state/selectors';
import {
	getCustomizerUrl,
	getSite,
	isJetpackMinimumVersion,
	isJetpackModuleActive,
	isJetpackSite,
	isSitePreviewable
} from 'state/sites/selectors';
import { getStatsPathForTab } from 'lib/route/path';
import { abtest } from 'lib/abtest';

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

	onPreviewSite = ( event ) => {
		const { site } = this.props;
		analytics.ga.recordEvent( 'Sidebar', 'Clicked View Site' );
		if ( site.is_previewable && ! event.metaKey && ! event.ctrlKey ) {
			event.preventDefault();
			this.props.setLayoutFocus( 'preview' );
		}
	};

	onViewSiteClick = ( event ) => {
		const {
			isPreviewable,
			siteSuffix,
		} = this.props;

		if ( ! isPreviewable ) {
			analytics.ga.recordEvent( 'Sidebar', 'Clicked View Site | Unpreviewable' );
			return;
		}

		if ( event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ) {
			analytics.ga.recordEvent( 'Sidebar', 'Clicked View Site | Modifier Key' );
			return;
		}

		event.preventDefault();
		analytics.ga.recordEvent( 'Sidebar', 'Clicked View Site | Calypso' );
		page( '/view' + siteSuffix );
	};

	itemLinkClass = ( paths, existingClasses ) => {
		const classSet = {};

		if ( typeof existingClasses !== 'undefined' ) {
			if ( ! Array.isArray( existingClasses ) ) {
				existingClasses = [ existingClasses ];
			}

			existingClasses.forEach( function( className ) {
				classSet[ className ] = true;
			} );
		}

		classSet.selected = this.isItemLinkSelected( paths );

		return classNames( classSet );
	};

	isItemLinkSelected( paths ) {
		if ( this.props.isPreviewShowing ) {
			return false;
		}

		if ( ! Array.isArray( paths ) ) {
			paths = [ paths ];
		}

		return paths.some( function( path ) {
			return path === this.props.path || 0 === this.props.path.indexOf( path + '/' );
		}, this );
	}

	manage() {
		return (
			<ManageMenu siteId={ this.props.siteId }
				itemLinkClass={ this.itemLinkClass }
				onNavigate={ this.onNavigate } />
		);
	}

	stats() {
		const { siteId, canUserViewStats } = this.props;

		if ( siteId && ! canUserViewStats ) {
			return null;
		}

		const statsLink = getStatsPathForTab( 'day', siteId );
		return (
			<SidebarItem
				tipTarget="menus"
				label={ this.props.translate( 'Stats' ) }
				className={ this.itemLinkClass( [ '/stats', '/store/stats' ], 'stats' ) }
				link={ statsLink }
				onNavigate={ this.onNavigate }
				icon="stats-alt">
				<a href={ statsLink }>
					<StatsSparkline className="sidebar__sparkline" siteId={ siteId } />
				</a>
			</SidebarItem>
		);
	}

	preview() {
		const {
			isPreviewable,
			site,
			siteId,
			translate,
		} = this.props;

		if ( ! siteId ) {
			return null;
		}

		const siteUrl = site && site.URL || '';

		return (
			<SidebarItem
				tipTarget="sitePreview"
				label={ translate( 'View Site' ) }
				className={ this.itemLinkClass( [ '/view' ], 'preview' ) }
				link={ siteUrl }
				onNavigate={ this.onViewSiteClick }
				icon="computer"
				preloadSectionName="preview"
				forceInternalLink={ isPreviewable }
			/>
		);
	}

	ads() {
		const { site, canUserManageOptions } = this.props;
		const adsLink = '/ads/earnings' + this.props.siteSuffix;
		const canManageAds = site && site.options.wordads && canUserManageOptions;

		return (
			canManageAds &&
			<SidebarItem
				label={ this.props.isJetpack ? 'Ads' : 'WordAds' }
				className={ this.itemLinkClass( '/ads', 'rads' ) }
				link={ adsLink }
				onNavigate={ this.onNavigate }
				icon="speaker" />
		);
	}

	themes() {
		const { site, canUserEditThemeOptions } = this.props,
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
				label={ this.props.translate( 'Themes' ) }
				tipTarget="themes"
				className={ this.itemLinkClass( '/themes', 'themes' ) }
				link={ themesLink }
				onNavigate={ this.onNavigate }
				icon="themes"
				preloadSectionName="themes"
			>
				<SidebarButton href={ this.props.customizeUrl } preloadSectionName="customize">
					{ this.props.translate( 'Customize' ) }
				</SidebarButton>
			</SidebarItem>
		);
	}

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

		const manageButton = this.props.isJetpack || ( ! this.props.siteId && this.props.hasJetpackSites )
			? <SidebarButton href={ managePluginsLink }>
					{ this.props.translate( 'Manage' ) }
				</SidebarButton>
			: null;

		return (
			<SidebarItem
				label={ this.props.translate( 'Plugins' ) }
				className={ this.itemLinkClass( [ '/extensions', '/plugins' ], 'plugins' ) }
				link={ pluginsLink }
				onNavigate={ this.onNavigate }
				icon="plugins"
				preloadSectionName="plugins"
			>
				{ manageButton }
			</SidebarItem>
		);
	}

	upgrades() {
		const { canUserManageOptions } = this.props;
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
				label={ this.props.translate( 'Domains' ) }
				className={ this.itemLinkClass( [ '/domains' ], 'domains' ) }
				link={ domainsLink }
				onNavigate={ this.onNavigate }
				icon="domains"
				preloadSectionName="domains"
			>
				<SidebarButton href={ addDomainLink }>
					{ this.props.translate( 'Add' ) }
				</SidebarButton>
			</SidebarItem>
		);
	}

	plan() {
		const { site, canUserManageOptions } = this.props;

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

		let linkClass = 'upgrades-nudge';

		if ( site && productsValues.isPlan( site.plan ) ) {
			linkClass += ' is-paid-plan';
		}

		let planName = site && site.plan.product_name_short;

		if ( site && productsValues.isFreeTrial( site.plan ) ) {
			planName = this.props.translate( 'Trial', {
				context: 'Label in the sidebar indicating that the user is on the free trial for a plan.'
			} );
		}

		return (
			<li className={ this.itemLinkClass( [ '/plans' ], linkClass ) }>
				<a onClick={ this.trackUpgradeClick } href={ planLink }>
					<JetpackLogo size={ 24 } />
					<span className="menu-link-text">{ this.props.translate( 'Plan', { context: 'noun' } ) }</span>
				</a>
				<a href={ planLink } className="plan-name" onClick={ this.trackUpgradeClick }>{ planName }</a>
			</li>
		);
	}

	trackStoreClick = () => {
		analytics.tracks.recordEvent( 'calypso_woocommerce_store_nav_item_click' );
		this.onNavigate();
	};

	store() {
		// IMPORTANT: If you add a country to this list, you must also add it
		// to ../../extensions/woocommerce/lib/countries in the getCountries function
		const allowedCountryCodes = [ 'US', 'CA' ];
		const { currentUser, canUserManageOptions, isJetpack, site, siteSuffix, translate } = this.props;
		const storeLink = '/store' + siteSuffix;
		const showStoreLink = config.isEnabled( 'woocommerce/extension-dashboard' ) &&
			site && isJetpack && canUserManageOptions &&
			( config.isEnabled( 'woocommerce/store-on-non-atomic-sites' ) || this.props.isSiteAutomatedTransfer );

		if ( ! showStoreLink ) {
			return null;
		}

		const countryCode = currentUser.user_ip_country_code;
		const isCountryAllowed =
			includes( allowedCountryCodes, countryCode ) ||
			( 'development' === config( 'env' ) );

		return (
			isCountryAllowed &&
			<SidebarItem
				label={ translate( 'Store (BETA)' ) }
				link={ storeLink }
				onNavigate={ this.trackStoreClick }
				icon="cart"
			>
				<Gridicon className="sidebar__chevron-right" icon="chevron-right" />
			</SidebarItem>
		);
	}

	trackUpgradeClick = () => {
		analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', {
			cta_name: 'sidebar_upgrade_default'
		} );
		this.onNavigate();
	};

	sharing() {
		const { isJetpack, isSharingEnabledOnJetpackSite, site } = this.props;
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
				className={ this.itemLinkClass( '/sharing', 'sharing' ) }
				link={ sharingLink }
				onNavigate={ this.onNavigate }
				icon="share"
				preloadSectionName="sharing" />
		);
	}

	users() {
		const { site, canUserListUsers } = this.props;
		let usersLink = '/people/team' + this.props.siteSuffix;
		const addPeopleLink = '/people/new' + this.props.siteSuffix;

		if ( ! site ) {
			return null;
		}

		if ( ! canUserListUsers ) {
			return null;
		}

		if ( ! config.isEnabled( 'manage/people' ) && site.options ) {
			usersLink = site.options.admin_url + 'users.php';
		}

		return (
			<SidebarItem
				label={ this.props.translate( 'People' ) }
				className={ this.itemLinkClass( '/people', 'users' ) }
				link={ usersLink }
				onNavigate={ this.onNavigate }
				icon="user"
				preloadSectionName="people"
			>
				<SidebarButton href={ addPeopleLink }>
					{ this.props.translate( 'Add' ) }
				</SidebarButton>
			</SidebarItem>
		);
	}

	siteSettings() {
		const { site, canUserManageOptions } = this.props;
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
				className={ this.itemLinkClass( '/settings', 'settings' ) }
				link={ siteSettingsLink }
				onNavigate={ this.onNavigate }
				icon="cog"
				preloadSectionName="settings"
				tipTarget="settings" />
		);
	}

	wpAdmin() {
		const { site } = this.props;

		if ( ! site || ! site.options ) {
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
				<a onClick={ this.trackWpadminClick } href={ site.options.admin_url } target="_blank" rel="noopener noreferrer">
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
		analytics.ga.recordEvent( 'Sidebar', 'Clicked WP Admin' );
	};

	focusContent = () => {
		this.props.setLayoutFocus( 'content' );
	};

	getAddNewSiteUrl() {
		if ( this.props.hasJetpackSites ||
			abtest( 'newSiteWithJetpack' ) === 'showNewJetpackSite' ) {
			return '/jetpack/new/?ref=calypso-selector';
		}
		return config( 'signup_url' ) + '?ref=calypso-selector';
	}

	addNewSite() {
		if ( this.props.currentUser.visible_site_count > 1 ) {
			return null;
		}

		return (
			<Button borderless
				className="my-sites-sidebar__add-new-site"
				href={ this.getAddNewSiteUrl() }
				onClick={ this.focusContent }
			>
				<Gridicon icon="add-outline" /> { this.props.translate( 'Add New Site' ) }
			</Button>
		);
	}

	renderSidebarMenus() {
		if ( this.props.isDomainOnly ) {
			return (
				<SidebarMenu>
					<ul>
						<SidebarItem
							className={ this.itemLinkClass( '/domains', 'settings' ) }
							icon="cog"
							label={ this.props.translate( 'Settings' ) }
							link={ '/domains/manage' + this.props.siteSuffix }
							onNavigate={ this.onNavigate } />
					</ul>
				</SidebarMenu>
			);
		}

		const manage = !! this.manage(),
			configuration = ( !! this.sharing() || !! this.users() || !! this.siteSettings() || !! this.plugins() || !! this.upgrades() );

		return (
			<div>
				<SidebarMenu>
					<ul>
						{ config.isEnabled( 'standalone-site-preview' ) && this.preview() }
						{ this.stats() }
						{ this.plan() }
						{ this.store() }
					</ul>
				</SidebarMenu>

				{ manage
					? <SidebarMenu>
						<SidebarHeading>{ this.props.translate( 'Manage' ) }</SidebarHeading>
						{ this.manage() }
					</SidebarMenu>
					: null
				}

				{ !! this.themes()
					? <SidebarMenu>
						<SidebarHeading>{ this.props.translate( 'Personalize' ) }</SidebarHeading>
						<ul>
							{ this.themes() }
						</ul>
					</SidebarMenu>
					: null
				}

				{ configuration
					? <SidebarMenu>
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
					: null
				}
			</div>
		);
	}

	render() {
		return (
			<Sidebar>
				<SidebarRegion>
					<CurrentSite
						allSitesPath={ this.props.allSitesPath }
						isPreviewShowing={ this.props.isPreviewShowing }
						onClick={ this.onPreviewSite }
					/>
					{ this.renderSidebarMenus() }
				</SidebarRegion>
				<SidebarFooter>
					{ this.addNewSite() }
				</SidebarFooter>
			</Sidebar>
		);
	}
}

function mapStateToProps( state ) {
	const currentUser = getCurrentUser( state );
	const selectedSiteId = getSelectedSiteId( state );
	const isSingleSite = !! selectedSiteId || currentUser.site_count === 1;
	const siteId = selectedSiteId || ( isSingleSite && getPrimarySiteId( state ) ) || null;
	const site = getSite( state, siteId );

	const isJetpack = isJetpackSite( state, siteId );

	const isSharingEnabledOnJetpackSite = isJetpackModuleActive( state, siteId, 'publicize' ) ||
		( isJetpackModuleActive( state, siteId, 'sharedaddy' ) && ! isJetpackMinimumVersion( state, siteId, '3.4-dev' ) );

	const isPreviewShowing = getCurrentLayoutFocus( state ) === 'preview';

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
		isPreviewShowing,
		isSharingEnabledOnJetpackSite,
		isSiteAutomatedTransfer: !! isSiteAutomatedTransfer( state, selectedSiteId ),
		siteId,
		site,
		siteSuffix: site ? '/' + site.slug : '',
	};
}

// TODO: make this pure when sites can be retrieved from the Redux state
export default connect( mapStateToProps, { setNextLayoutFocus, setLayoutFocus }, null, { pure: false } )( localize( MySitesSidebar ) );
