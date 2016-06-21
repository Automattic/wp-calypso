/**
 * External dependencies
 */
var analytics = require( 'lib/analytics' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:my-sites:sidebar' ),
	has = require( 'lodash/has' ),
	includes = require( 'lodash/includes' ),
	React = require( 'react' );

import page from 'page';

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	CurrentSite = require( 'my-sites/current-site' ),
	getCustomizeUrl = require( '../themes/helpers' ).getCustomizeUrl,
	Gridicon = require( 'components/gridicon' ),
	productsValues = require( 'lib/products-values' ),
	PublishMenu = require( './publish-menu' ),
	Sidebar = require( 'layout/sidebar' ),
	SidebarHeading = require( 'layout/sidebar/heading' ),
	SidebarItem = require( 'layout/sidebar/item' ),
	SidebarMenu = require( 'layout/sidebar/menu' ),
	SidebarRegion = require( 'layout/sidebar/region' ),
	SiteStatsStickyLink = require( 'components/site-stats-sticky-link' );

import Button from 'components/button';
import SidebarButton from 'layout/sidebar/button';
import SidebarFooter from 'layout/sidebar/footer';
import { isPersonal, isPremium, isBusiness } from 'lib/products-values';
import { abtest } from 'lib/abtest';

module.exports = React.createClass( {
	displayName: 'MySitesSidebar',

	componentDidMount: function() {
		debug( 'The sidebar React component is mounted.' );
	},

	onNavigate: function() {
		this.props.layoutFocus.setNext( 'content' );
		window.scrollTo( 0, 0 );
	},

	onPreviewSite( event ) {
		const site = this.getSelectedSite();
		if ( site.is_previewable && ! event.metaKey && ! event.ctrlKey ) {
			event.preventDefault();
			this.props.layoutFocus.set( 'preview' );
		}
	},

	itemLinkClass: function( paths, existingClasses ) {
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
	},

	isItemLinkSelected: function( paths ) {
		if ( ! Array.isArray( paths ) ) {
			paths = [ paths ];
		}

		return paths.some( function( path ) {
			return path === this.props.path || 0 === this.props.path.indexOf( path + '/' );
		}, this );
	},

	isSingle: function() {
		return !! ( this.props.sites.getSelectedSite() || this.props.sites.get().length === 1 );
	},

	getSingleSiteDomain: function() {
		if ( this.props.sites.selected ) {
			return this.getSelectedSite().slug;
		}

		return this.props.sites.getPrimary().slug;
	},

	getSelectedSite: function() {
		if ( this.props.sites.get().length === 1 ) {
			return this.props.sites.getPrimary();
		}

		return this.props.sites.getSelectedSite();
	},

	hasJetpackSites: function() {
		return this.props.sites.get().some( function( site ) {
			return site.jetpack;
		} );
	},

	siteSuffix: function() {
		return this.isSingle() ? '/' + this.getSingleSiteDomain() : '';
	},

	publish: function() {
		return (
			<PublishMenu site={ this.getSelectedSite() }
				sites={ this.props.sites }
				siteSuffix={ this.siteSuffix() }
				isSingle={ this.isSingle() }
				itemLinkClass={ this.itemLinkClass }
				onNavigate={ this.onNavigate } />
		);
	},

	stats: function() {
		var site = this.getSelectedSite();

		if ( site && ! site.capabilities ) {
			return null;
		}

		if ( site && site.capabilities && ! site.capabilities.view_stats ) {
			return null;
		}

		return (
			<li className={ this.itemLinkClass( '/stats', 'stats' ) }>
				<SiteStatsStickyLink onClick={ this.onNavigate }>
					<Gridicon icon="stats-alt" size={ 24 } />
					<span className="menu-link-text">{ this.translate( 'Stats' ) }</span>
				</SiteStatsStickyLink>
			</li>
		);
	},

	ads: function() {
		var site = this.getSelectedSite(),
			adsLink = '/ads/earnings' + this.siteSuffix();

		if ( !site || ! site.options.wordads ) {
			return null;
		}

		return (
			<SidebarItem
				label={ site.jetpack ? 'AdControl' : 'WordAds' }
				className={ this.itemLinkClass( '/ads', 'rads' ) }
				link={ adsLink }
				onNavigate={ this.onNavigate }
				icon="speaker" />
		);
	},

	themes: function() {
		var site = this.getSelectedSite(),
			jetpackEnabled = config.isEnabled( 'manage/themes-jetpack' ),
			themesLink;

		if ( site && ! site.isCustomizable() ) {
			return null;
		}

		if ( ! config.isEnabled( 'manage/themes' ) ) {
			return null;
		}

		if ( site.jetpack && ! jetpackEnabled && site.options ) {
			themesLink = site.options.admin_url + 'themes.php';
		} else if ( this.isSingle() ) {
			themesLink = '/design' + this.siteSuffix();
		} else {
			themesLink = '/design';
		}

		return (
			<SidebarItem
				label={ this.translate( 'Themes' ) }
				tipTarget="themes"
				className={ this.itemLinkClass( '/design', 'themes' ) }
				link={ themesLink }
				onNavigate={ this.onNavigate }
				icon="themes"
				preloadSectionName="themes"
			>
				<SidebarButton href={ getCustomizeUrl( null, site ) } preloadSectionName="customize">
					{ this.translate( 'Customize' ) }
				</SidebarButton>
			</SidebarItem>
		);
	},

	menus: function() {
		var site = this.getSelectedSite(),
			menusLink = '/menus' + this.siteSuffix(),
			showClassicLink = ! config.isEnabled( 'manage/menus' );

		if ( ! site ) {
			return null;
		}

		if ( ! site.capabilities ) {
			return null;
		}

		if ( site.capabilities && ! site.capabilities.edit_theme_options ) {
			return null;
		}

		if ( ! this.isSingle() ) {
			return null;
		}

		if ( showClassicLink ) {
			menusLink = site.options.admin_url + 'nav-menus.php';
		}

		return (
			<SidebarItem
				tipTarget="menus"
				label={ this.translate( 'Menus' ) }
				className={ this.itemLinkClass( '/menus', 'menus' ) }
				link={ menusLink }
				onNavigate={ this.onNavigate }
				icon="menus"
				preloadSectionName="menus" />
		);
	},

	plugins: function() {
		var site = this.getSelectedSite(),
			pluginsLink = '/plugins' + this.siteSuffix(),
			addPluginsLink;

		if ( ! config.isEnabled( 'manage/plugins' ) ) {
			if ( ! this.isSingle() ) {
				return null;
			}

			if ( site.options ) {
				pluginsLink = site.options.admin_url + 'plugins.php';
			}
		}

		if ( ! this.props.sites.canManageSelectedOrAll() ) {
			return null;
		}

		if ( ( this.isSingle() && site.jetpack ) || ( ! this.isSingle() && this.hasJetpackSites() ) ) {
			addPluginsLink = '/plugins/browse' + this.siteSuffix();
		}

		return (
			<SidebarItem
				label={ this.translate( 'Plugins' ) }
				className={ this.itemLinkClass( '/plugins', 'plugins' ) }
				link={ pluginsLink }
				onNavigate={ this.onNavigate }
				icon="plugins"
				preloadSectionName="plugins"
			>
				<SidebarButton href={ addPluginsLink }>
					{ this.translate( 'Add' ) }
				</SidebarButton>
			</SidebarItem>
		);
	},

	upgrades: function() {
		var site = this.getSelectedSite(),
			domainsLink = '/domains/manage' + this.siteSuffix(),
			addDomainLink = '/domains/add' + this.siteSuffix();

		if ( ! config.isEnabled( 'manage/plans' ) ) {
			return null;
		}

		if ( ! this.isSingle() ) {
			return null;
		}

		if ( ! site.capabilities ) {
			return null;
		}

		if ( site.capabilities && ! site.capabilities.manage_options ) {
			return null;
		}

		if ( site.jetpack ) {
			return null;
		}

		return (
			<SidebarItem
				label={ this.translate( 'Domains' ) }
				className={ this.itemLinkClass( [ '/domains' ], 'domains' ) }
				link={ domainsLink }
				onNavigate={ this.onNavigate }
				icon="globe"
				preloadSectionName="upgrades"
			>
				<SidebarButton href={ addDomainLink }>
					{ this.translate( 'Add' ) }
				</SidebarButton>
			</SidebarItem>
		);
	},

	plan: function() {
		if ( ! config.isEnabled( 'manage/plans' ) ) {
			return null;
		}

		if ( ! this.isSingle() ) {
			return null;
		}

		const site = this.getSelectedSite();

		if ( ! site.capabilities ) {
			return null;
		}

		if ( site.capabilities && ! site.capabilities.manage_options ) {
			return null;
		}

		let planLink = '/plans' + this.siteSuffix();

		if ( config.isEnabled( 'manage/plan-features' ) && abtest( 'planFeatures' ) === 'show' ) {
			planLink = '/plans/features' + this.siteSuffix();
		}

		// Show plan details for upgraded sites
		if (
			site &&
			( isPersonal( site.plan ) || isPremium( site.plan ) || isBusiness( site.plan ) )
		) {
			planLink = '/plans/my-plan' + this.siteSuffix();
		}

		let linkClass = 'upgrades-nudge';

		if ( productsValues.isPlan( site.plan ) ) {
			linkClass += ' is-paid-plan';
		}

		let planName = site.plan.product_name_short;

		if ( productsValues.isFreeTrial( site.plan ) ) {
			planName = this.translate( 'Trial', {
				context: 'Label in the sidebar indicating that the user is on the free trial for a plan.'
			} );
		}

		return (
			<li className={ this.itemLinkClass( [ '/plans' ], linkClass ) }>
				<a onClick={ this.trackUpgradeClick } href={ planLink }>
					<Gridicon icon="clipboard" size={ 24 } />
					<span className="menu-link-text">{ this.translate( 'Plan', { context: 'noun' } ) }</span>
				</a>
				<a href={ planLink } className="plan-name" onClick={ this.trackUpgradeClick }>{ planName }</a>
			</li>
		);
	},

	trackUpgradeClick: function() {
		analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', {
			cta_name: 'sidebar_upgrade_default'
		} );
		this.onNavigate();
	},

	sharing: function() {
		var site = this.getSelectedSite(),
			sharingLink = '/sharing' + this.siteSuffix();

		if ( ! site.capabilities ) {
			return null;
		}

		if ( site.jetpack && ! site.isModuleActive( 'publicize' ) && ( ! site.isModuleActive( 'sharedaddy' ) || site.versionCompare( '3.4-dev', '<' ) ) ) {
			return null;
		}

		if ( site.capabilities && ! site.capabilities.publish_posts ) {
			return null;
		}

		if ( ! this.isSingle() ) {
			return null;
		}

		if ( ! config.isEnabled( 'manage/sharing' ) && site.options ) {
			sharingLink = site.options.admin_url + 'options-general.php?page=sharing';
		}

		return (
			<SidebarItem
				label={ this.translate( 'Sharing' ) }
				className={ this.itemLinkClass( '/sharing', 'sharing' ) }
				link={ sharingLink }
				onNavigate={ this.onNavigate }
				icon="share"
				preloadSectionName="sharing" />
		);
	},

	users: function() {
		var site = this.getSelectedSite(),
			usersLink = '/people/team' + this.siteSuffix(),
			addPeopleLink = '/people/new' + this.siteSuffix();

		if ( ! site.capabilities ) {
			return null;
		}

		if ( site.capabilities && ! site.capabilities.list_users ) {
			return null;
		}

		if ( ! this.isSingle() ) {
			return null;
		}

		if ( ! config.isEnabled( 'manage/people' ) && site.options ) {
			usersLink = site.options.admin_url + 'users.php';
		}

		if ( site.options && ( ! config.isEnabled( 'manage/add-people' ) || site.jetpack ) ) {
			addPeopleLink = ( site.jetpack )
				? site.options.admin_url + 'user-new.php'
				: site.options.admin_url + 'users.php?page=wpcom-invite-users';
		}

		return (
			<SidebarItem
				label={ this.translate( 'People' ) }
				className={ this.itemLinkClass( '/people', 'users' ) }
				link={ usersLink }
				onNavigate={ this.onNavigate }
				icon="user"
				preloadSectionName="people"
			>
				<SidebarButton href={ addPeopleLink }>
					{ this.translate( 'Add' ) }
				</SidebarButton>
			</SidebarItem>
		);
	},

	siteSettings: function() {
		var site = this.getSelectedSite(),
			siteSettingsLink = '/settings/general' + this.siteSuffix();

		if ( ! site.capabilities ) {
			return null;
		}

		if ( site.capabilities && ! site.capabilities.manage_options ) {
			return null;
		}

		if ( ! this.isSingle() ) {
			return null;
		}

		return (
			<SidebarItem
				label={ this.translate( 'Settings' ) }
				className={ this.itemLinkClass( '/settings', 'settings' ) }
				link={ siteSettingsLink }
				onNavigate={ this.onNavigate }
				icon="cog"
				preloadSectionName="settings" />
		);
	},

	wpAdmin: function() {
		var site = this.getSelectedSite(),
			currentUser = this.props.user.get();

		if ( ! site.options ) {
			return null;
		}

		// only skip wpadmin for non-vip
		if ( ! site.is_vip ) {
			// safety check for nested attribute
			if ( ! has( currentUser, 'meta.data.flags.active_flags' ) ) {
				return null;
			}

			if ( ! includes( currentUser.meta.data.flags.active_flags, 'wpcom-use-wpadmin-flows' ) ) {
				return null;
			}
		}

		return (
			<li className="wp-admin">
				<a onClick={ this.trackWpadminClick } href={ site.options.admin_url } target="_blank">
					<Gridicon icon="my-sites" size={ 24 } />
					<span className="menu-link-text">{ this.translate( 'WP Admin' ) }</span>
					<span className="noticon noticon-external" />
				</a>
			</li>
		);
	},

	trackWpadminClick: function() {
		analytics.ga.recordEvent( 'Sidebar', 'Clicked WP Admin' );
	},

	vip: function() {
		var site, viplink;

		if ( ! config.isEnabled( 'vip' ) ) {
			return null;
		}

		site = this.getSelectedSite();
		viplink = '/vip/updates' + this.siteSuffix();

		if ( ! site ) {
			return null;
		}

		return (
			<li className={ this.itemLinkClass( '/vip/updates', 'sidebar__vip' ) } >
				<a href={ viplink } >
					<span className="menu-link-text">{ this.translate( 'Updates' ) }</span>
				</a>
			</li>
		);
	},

	vipDeploys: function() {
		var site, viplink;

		if ( ! config.isEnabled( 'vip/deploys' ) ) {
			return null;
		}

		site = this.getSelectedSite();
		viplink = '/vip/deploys' + this.siteSuffix();

		if ( ! site ) {
			return null;
		}

		return (
			<li className={ this.itemLinkClass( '/vip/deploys', 'sidebar__vip-deploys' ) } >
				<a href={ viplink } >
					<span className="menu-link-text">{ this.translate( 'Deploys' ) }</span>
				</a>
			</li>
		);
	},

	vipBilling: function() {
		var site, viplink;

		if ( ! config.isEnabled( 'vip/billing' ) ) {
			return null;
		}

		site = this.getSelectedSite();
		viplink = '/vip/billing' + this.siteSuffix();

		if ( ! site ) {
			return null;
		}

		return (
			<li className={ this.itemLinkClass( '/vip/billing', 'sidebar__vip-billing' ) }>
				<a href={ viplink } >
					<span className="menu-link-text">{ this.translate( 'Billing' ) }</span>
				</a>
			</li>
		);
	},

	vipSupport: function() {
		var viplink;

		if ( ! config.isEnabled( 'vip/support' ) ) {
			return null;
		}

		viplink = '/vip/support' + this.siteSuffix();

		return (
			<li className={ this.itemLinkClass( '/vip/support', 'sidebar__vip-support' ) }>
				<a href={ viplink } >
					<span className="menu-link-text">{ this.translate( 'Support' ) }</span>
				</a>
			</li>
		);
	},

	vipBackups: function() {
		var site, viplink;

		if ( ! config.isEnabled( 'vip/backups' ) ) {
			return null;
		}

		site = this.getSelectedSite();
		viplink = '/vip/backups' + this.siteSuffix();

		if ( ! site ) {
			return null;
		}

		return (
			<li className={ this.itemLinkClass( '/vip/backups', 'sidebar__vip-backups' ) }>
				<a href={ viplink } >
					<span className="menu-link-text">{ this.translate( 'Backups' ) }</span>
				</a>
			</li>
		);
	},

	vipLogs: function() {
		var site, viplink;

		if ( ! config.isEnabled( 'vip/logs' ) ) {
			return null;
		}

		site = this.getSelectedSite();
		viplink = '/vip/logs' + this.siteSuffix();

		if ( ! site ) {
			return null;
		}

		return (
			<li className={ this.itemLinkClass( '/vip/logs', 'sidebar__vip-logs' ) }>
				<a href={ viplink } >
					<span className="menu-link-text">{ this.translate( 'Logs' ) }</span>
				</a>
			</li>
		);
	},

	focusContent: function() {
		this.props.layoutFocus.set( 'content' );
	},

	addNewWordPress: function() {
		if ( this.props.user.get().visible_site_count > 1 ) {
			return null;
		}

		return (
			<Button compact borderless
				className="my-sites-sidebar__add-new-site"
				href={ config( 'signup_url' ) + '?ref=calypso-selector' }
				onClick={ this.focusContent }
			>
				<Gridicon icon="add-outline" /> { this.translate( 'Add New Site' ) }
			</Button>
		);
	},

	render: function() {
		var publish = !! this.publish(),
			appearance = ( !! this.themes() || !! this.menus() ),
			configuration = ( !! this.sharing() || !! this.users() || !! this.siteSettings() || !! this.plugins() || !! this.upgrades() ),
			vip = !! this.vip();

		return (
			<Sidebar>
				<SidebarRegion>
				<CurrentSite
					sites={ this.props.sites }
					siteCount={ this.props.user.get().visible_site_count }
					onClick={ this.onPreviewSite }
				/>
				<SidebarMenu>
					<ul>
						{ this.stats() }
						{ this.plan() }
					</ul>
				</SidebarMenu>

				{ vip
					? <SidebarMenu>
						<SidebarHeading>VIP</SidebarHeading>
						<ul>
							{ this.vip() }
							{ this.vipDeploys() }
							{ this.vipBilling() }
							{ this.vipSupport() }
							{ this.vipBackups() }
							{ this.vipLogs() }
						</ul>
					</SidebarMenu>
					: null
				}

				{ publish
					? <SidebarMenu>
						<SidebarHeading>{ this.translate( 'Publish' ) }</SidebarHeading>
						{ this.publish() }
					</SidebarMenu>
					: null
				}

				{ appearance
					? <SidebarMenu>
						<SidebarHeading>{ this.translate( 'Personalize' ) }</SidebarHeading>
						<ul>
							{ this.themes() }
							{ this.menus() }
						</ul>
					</SidebarMenu>
					: null
				}

				{ configuration
					? <SidebarMenu>
						<SidebarHeading>{ this.translate( 'Configure' ) }</SidebarHeading>
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
				</SidebarRegion>
				<SidebarFooter>
					{ this.addNewWordPress() }
				</SidebarFooter>
			</Sidebar>
		);
	}
} );
