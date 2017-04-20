/**
 * External dependencies
 */
import classNames from 'classnames';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';
import config from 'config';
import CurrentSite from 'my-sites/current-site';
import productsValues from 'lib/products-values';
import PublishMenu from './publish-menu';
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
import { setNextLayoutFocus, setLayoutFocus } from 'state/ui/layout-focus/actions';
import { canCurrentUser, getMenusUrl, getPrimarySiteId, getSites, isDomainOnlySite } from 'state/selectors';
import {
	getCustomizerUrl,
	getSite,
	isJetpackMinimumVersion,
	isJetpackModuleActive,
	isJetpackSite
} from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { getStatsPathForTab } from 'lib/route/path';
import { isATEnabled } from 'lib/automated-transfer';
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
		sites: PropTypes.object,
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
		if ( site.is_previewable && ! event.metaKey && ! event.ctrlKey ) {
			event.preventDefault();
			this.props.setLayoutFocus( 'preview' );
		}
	};

	itemLinkClass = ( paths, existingClasses ) => {
		var classSet = {};

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
		if ( ! Array.isArray( paths ) ) {
			paths = [ paths ];
		}

		return paths.some( function( path ) {
			return path === this.props.path || 0 === this.props.path.indexOf( path + '/' );
		}, this );
	}

	publish() {
		return (
			<PublishMenu siteId={ this.props.siteId }
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
				className={ this.itemLinkClass( '/stats', 'stats' ) }
				link={ statsLink }
				onNavigate={ this.onNavigate }
				icon="stats-alt">
				<a href={ statsLink }>
					<StatsSparkline className="sidebar__sparkline" siteId={ siteId } />
				</a>
			</SidebarItem>
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

	menus() {
		const { menusUrl } = this.props;
		if ( ! menusUrl ) {
			return null;
		}

		return (
			<SidebarItem
				tipTarget="menus"
				label={ this.props.translate( 'Menus' ) }
				className={ this.itemLinkClass( '/menus', 'menus' ) }
				link={ menusUrl }
				onNavigate={ this.onNavigate }
				icon="menus"
				preloadSectionName="menus" />
		);
	}

	plugins() {
		const { site } = this.props;
		let pluginsLink = '/plugins' + this.props.siteSuffix;
		let addPluginsLink;

		if ( this.props.atEnabled ) {
			addPluginsLink = '/plugins/browse' + this.props.siteSuffix;
		}

		if ( ! config.isEnabled( 'manage/plugins' ) ) {
			if ( ! this.props.siteId ) {
				return null;
			}

			if ( site.options ) {
				pluginsLink = site.options.admin_url + 'plugins.php';
			}
		}

		if ( ! this.props.canManagePlugins ) {
			return null;
		}

		if ( ( this.props.siteId && this.props.isJetpack ) || ( ! this.props.siteId && this.props.hasJetpackSites ) ) {
			addPluginsLink = '/plugins/browse' + this.props.siteSuffix;
		}

		return (
			<SidebarItem
				label={ this.props.translate( 'Plugins' ) }
				className={ this.itemLinkClass( '/plugins', 'plugins' ) }
				link={ pluginsLink }
				onNavigate={ this.onNavigate }
				icon="plugins"
				preloadSectionName="plugins"
			>
				<SidebarButton href={ addPluginsLink }>
					{ this.props.translate( 'Add' ) }
				</SidebarButton>
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

		if ( this.props.isJetpack && ! this.props.atEnabled ) {
			return null;
		}

		return (
			<SidebarItem
				label={ this.props.translate( 'Domains' ) }
				className={ this.itemLinkClass( [ '/domains' ], 'domains' ) }
				link={ domainsLink }
				onNavigate={ this.onNavigate }
				icon="domains"
				preloadSectionName="upgrades"
			>
				<SidebarButton href={ addDomainLink }>
					{ this.props.translate( 'Add' ) }
				</SidebarButton>
			</SidebarItem>
		);
	}

	plan() {
		if ( ! this.props.siteId ) {
			return null;
		}

		const { site, canUserManageOptions } = this.props;

		if ( site && ! canUserManageOptions ) {
			return null;
		}

		let planLink = '/plans' + this.props.siteSuffix;

		// Show plan details for upgraded sites
		if (
			site &&
			( isPersonal( site.plan ) || isPremium( site.plan ) || isBusiness( site.plan ) )
		) {
			planLink = '/plans/my-plan' + this.props.siteSuffix;
		}

		let linkClass = 'upgrades-nudge';

		if ( productsValues.isPlan( site.plan ) ) {
			linkClass += ' is-paid-plan';
		}

		let planName = site.plan.product_name_short;

		if ( productsValues.isFreeTrial( site.plan ) ) {
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
		let addPeopleLink = '/people/new' + this.props.siteSuffix;

		if ( site && ! canUserListUsers ) {
			return null;
		}

		if ( ! this.props.siteId ) {
			return null;
		}

		if ( ! config.isEnabled( 'manage/people' ) && site.options ) {
			usersLink = site.options.admin_url + 'users.php';
		}

		if ( site.options && this.props.isJetpack ) {
			addPeopleLink = ( this.props.isJetpack )
				? site.options.admin_url + 'user-new.php'
				: site.options.admin_url + 'users.php?page=wpcom-invite-users';
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
		if ( site.is_vip ) {
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
		if ( this.props.sites.getJetpack().length ||
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

		const publish = !! this.publish(),
			appearance = ( !! this.themes() || !! this.menus() ),
			configuration = ( !! this.sharing() || !! this.users() || !! this.siteSettings() || !! this.plugins() || !! this.upgrades() );

		return (
			<div>
				<SidebarMenu>
					<ul>
						{ this.stats() }
						{ this.plan() }
					</ul>
				</SidebarMenu>

				{ publish
					? <SidebarMenu>
						<SidebarHeading>{ this.props.translate( 'Publish' ) }</SidebarHeading>
						{ this.publish() }
					</SidebarMenu>
					: null
				}

				{ appearance
					? <SidebarMenu>
						<SidebarHeading>{ this.props.translate( 'Personalize' ) }</SidebarHeading>
						<ul>
							{ this.themes() }
							{ this.menus() }
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
						sites={ this.props.sites }
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
	// FIXME: Fun with Boolean algebra :-)
	const isSharingEnabledOnJetpackSite = ! (
		! isJetpackModuleActive( state, siteId, 'publicize' ) &&
		( ! isJetpackModuleActive( state, siteId, 'sharedaddy' ) || isJetpackMinimumVersion( state, siteId, '3.4-dev' ) )
	);
	// FIXME: Turn into dedicated selector
	const canManagePlugins = !! getSites( state ).some( ( s ) => (
		( s.capabilities && s.capabilities.manage_options )
	) );
	// FIXME: Turn into dedicated selector
	const hasJetpackSites = getSites( state ).some( s => s.jetpack );

	return {
		atEnabled: isATEnabled( site ),
		canManagePlugins,
		canUserEditThemeOptions: canCurrentUser( state, siteId, 'edit_theme_options' ),
		canUserListUsers: canCurrentUser( state, siteId, 'list_users' ),
		canUserManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
		canUserPublishPosts: canCurrentUser( state, siteId, 'publish_posts' ),
		canUserViewStats: canCurrentUser( state, siteId, 'view_stats' ),
		currentUser,
		customizeUrl: getCustomizerUrl( state, selectedSiteId ),
		hasJetpackSites,
		isDomainOnly: isDomainOnlySite( state, selectedSiteId ),
		isJetpack,
		isSharingEnabledOnJetpackSite,
		isSiteAutomatedTransfer: !! isSiteAutomatedTransfer( state, selectedSiteId ),
		menusUrl: getMenusUrl( state, siteId ),
		siteId,
		site,
		siteSuffix: site ? '/' + site.slug : '',
	};
}

// TODO: make this pure when sites can be retrieved from the Redux state
export default connect( mapStateToProps, { setNextLayoutFocus, setLayoutFocus }, null, { pure: false } )( localize( MySitesSidebar ) );
