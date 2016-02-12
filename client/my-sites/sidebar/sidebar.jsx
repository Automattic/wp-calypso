/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:my-sites:sidebar' ),
	analytics = require( 'analytics' ),
	startsWith = require( 'lodash/startsWith' ),
	has = require( 'lodash/has' ),
	includes = require( 'lodash/includes' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	CurrentSite = require( 'my-sites/current-site' ),
	PublishMenu = require( './publish-menu' ),
	SiteStatsStickyLink = require( 'components/site-stats-sticky-link' ),
	productsValues = require( 'lib/products-values' ),
	getCustomizeUrl = require( '../themes/helpers' ).getCustomizeUrl,
	AdsUtils = require( 'lib/ads/utils' ),
	Gridicon = require( 'components/gridicon' ),
	Sidebar = require( 'layout/sidebar' ),
	SidebarHeading = require( 'layout/sidebar/heading' ),
	SidebarItem = require( 'layout/sidebar/item' ),
	SidebarMenu = require( 'layout/sidebar/menu' ),
	abtest = require( 'lib/abtest' ).abtest;

module.exports = React.createClass( {
	displayName: 'MySitesSidebar',

	componentDidMount: function() {
		debug( 'The sidebar React component is mounted.' );
	},

	onNavigate: function() {
		this.props.layoutFocus.setNext( 'content' );
		window.scrollTo( 0, 0 );
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
			return startsWith( this.props.path, path );
		}, this );
	},

	isSingle: function() {
		return this.props.sites.selected || this.props.sites.get().length === 1;
	},

	getSingleSiteDomain: function() {
		if ( this.props.sites.selected ) {
			return this.props.sites.selected;
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

		if ( ! site.capabilities ) {
			return null;
		}

		if ( site.capabilities && ! site.capabilities.view_stats ) {
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

		if ( ! AdsUtils.canAccessWordads( site ) ) {
			return null;
		}

		return (
			<SidebarItem
				label={ site.jetpack ? 'AdControl' : 'WordAds' }
				className={ this.itemLinkClass( '/ads', 'ads' ) }
				link={ adsLink }
				onNavigate={ this.onNavigate }
				icon={ 'speaker' } />
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
				className={ this.itemLinkClass( '/design', 'themes' ) }
				link={ themesLink }
				buttonLink={ getCustomizeUrl( null, site ) }
				buttonLabel={ this.translate( 'Customize' ) }
				onNavigate={ this.onNavigate }
				icon={ 'themes' }
				preloadSectionName="themes" />
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
			<li className={ this.itemLinkClass( '/menus', 'menus' ) }>
				<a onClick={ this.onNavigate } href={ menusLink } target={ showClassicLink ? '_blank' : null }>
					<Gridicon icon="menus" size={ 24 } />
					<span className="menu-link-text">{ this.translate( 'Menus' ) }</span>
					{ showClassicLink ? <span className="noticon noticon-external" /> : null }
				</a>
			</li>
		);
	},

	plugins: function() {
		var site = this.getSelectedSite(),
			pluginsLink = '/plugins' + this.siteSuffix(),
			pluginsBrowseLink = '/plugins/browse' + this.siteSuffix(),
			addPluginsButton;

		if ( ! this.isSingle() && ! config.isEnabled( 'manage/plugins' ) ) {
			return null;
		}

		if ( ! this.props.sites.canManageSelectedOrAll() ) {
			return null;
		}

		if ( ! this.props.sites.hasSiteWithPlugins() && ! this.isSingle() ) {
			return null;
		}

		if ( ! config.isEnabled( 'manage/plugins' ) && site.options ) {
			pluginsLink = site.options.admin_url + 'plugins.php';
		}

		if ( config.isEnabled( 'manage/plugins/browser' ) ) {
			if ( ( this.isSingle() && site.jetpack ) || ( this.hasJetpackSites() && ! this.isSingle() ) ) {
				addPluginsButton = <a onClick={ this.onNavigate } href={ pluginsBrowseLink } className="add-new">{ this.translate( 'Add' ) }</a>;
			}
		}

		return (
			<li className={ this.itemLinkClass( '/plugins', 'plugins' ) }>
				<a onClick={ this.onNavigate } href={ pluginsLink } target={ ! config.isEnabled( 'manage/plugins' ) ? '_blank' : null }>
					<Gridicon icon="plugins" size={ 24 } />
					<span className="menu-link-text">{ this.translate( 'Plugins' ) }</span>
					{ ! config.isEnabled( 'manage/plugins' ) ? <span className="noticon noticon-external" /> : null }
				</a>
				{ addPluginsButton }
			</li>
		);
	},

	upgrades: function() {
		var site = this.getSelectedSite(),
			target = null,
			domainsLink = '/domains' + this.siteSuffix(),
			addDomainLink = '/domains/add' + this.siteSuffix(),
			addDomainButton = '';

		if ( ! site ) {
			return null;
		}

		if ( ! site.capabilities ) {
			return null;
		}

		if ( site.capabilities && ! site.capabilities.manage_options ) {
			return null;
		}

		if ( ! this.isSingle() && ! config.isEnabled( 'manage/plans' ) ) {
			return null;
		}

		if ( ! config.isEnabled( 'manage/plans' ) ) {
			return null;
		}

		if ( site.jetpack ) {
			return null;
		}

		if ( config.isEnabled( 'upgrades/domain-search' ) ) {
			addDomainButton = <a onClick={ this.onNavigate } href={ addDomainLink } className="add-new">{ this.translate( 'Add' ) }</a>;
		}

		return (
			<li className={ this.itemLinkClass( [ '/domains' ], 'domains' ) }>
				<a onClick={ this.onNavigate } href={ domainsLink } target={ target }>
					<Gridicon icon="globe" size={ 24 } />
					<span className="menu-link-text">{ this.translate( 'Domains' ) }</span>
				</a>
				{ addDomainButton }
			</li>
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

		const planLink = '/plans' + this.siteSuffix();

		let linkClass = 'upgrades-nudge';

		if ( productsValues.isPlan( site.plan ) ) {
			linkClass += ' is-paid-plan';
		}

		let planName = site.plan.product_name_short,
			labelClass = 'plan-name';

		const testVariation = abtest( 'plansUpgradeButton' );

		if ( testVariation !== 'original' && productsValues.isFreePlan( site.plan ) ) {
			labelClass = 'add-new';

			if ( testVariation === 'free' ) {
				planName = 'Free'; // TODO: translate this string if the test is removed
			}

			if ( testVariation === 'add' ) {
				planName = 'Add'; // TODO: translate this string if the test is removed
			}

			if ( testVariation === 'info' ) {
				planName = 'Info'; // TODO: translate this string if the test is removed
			}

			if ( testVariation === 'change' ) {
				planName = 'Change'; // TODO: translate this string if the test is removed
			}
		}

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
				<a href={ planLink } className={ labelClass } onClick={ this.trackUpgradeClick }>{ planName }</a>
			</li>
		);
	},

	trackUpgradeClick: function() {
		analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', { cta_name: 'sidebar_upgrade_default' } );
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
			<li className={ this.itemLinkClass( '/sharing', 'sharing' ) }>
				<a onClick={ this.onNavigate } href={ sharingLink } target={ ! config.isEnabled( 'manage/sharing' ) ? '_blank' : null }>
					<Gridicon icon="share" size={ 24 } />
					<span className="menu-link-text">{ this.translate( 'Sharing' ) }</span>
					{ ! config.isEnabled( 'manage/sharing' ) ? <span className="noticon noticon-external" /> : null }
				</a>
			</li>
		);
	},

	users: function() {
		var site = this.getSelectedSite(),
			usersLink = '/people/team' + this.siteSuffix(),
			addPeopleLink = '/people/new' + this.siteSuffix(),
			addPeopleTarget = '_self',
			addPeopleButton;

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
			addPeopleTarget = '_blank';
		}

		if ( config.isEnabled( 'manage/people' ) ) {
			addPeopleButton = <a onClick={ this.onNavigate } href={ addPeopleLink } className="add-new" target={ addPeopleTarget }>{ this.translate( 'Add' ) }</a>;
		}

		return (
			<li className={ this.itemLinkClass( '/people', 'users' ) }>
				<a onClick={ this.onNavigate } href={ usersLink } target={ ! config.isEnabled( 'manage/people' ) ? '_blank' : null }>
					<Gridicon icon="user" size={ 24 } />
					<span className="menu-link-text">{ ! config.isEnabled( 'manage/people' ) ? this.translate( 'Users' ) : this.translate( 'People' ) }</span>
					{ ! config.isEnabled( 'manage/people' ) ? <span className="noticon noticon-external" /> : null }
				</a>
				{ addPeopleButton }
			</li>
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
			<li className={ this.itemLinkClass( '/settings', 'settings' ) }>
				<a onClick={ this.onNavigate } href={ siteSettingsLink }>
					<Gridicon icon="cog" size={ 24 } />
					<span className="menu-link-text">{ this.translate( 'Settings' ) }</span>
				</a>
			</li>
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

		site = this.getSelectedSite()
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

	render: function() {
		var publish = !! this.publish(),
			appearance = ( !! this.themes() || !! this.menus() ),
			configuration = ( !! this.sharing() || !! this.users() || !! this.siteSettings() || !! this.plugins() || !! this.upgrades() ),
			vip = !! this.vip();

		return (
			<Sidebar>
				<CurrentSite
					sites={ this.props.sites }
					siteCount={ this.props.user.get().visible_site_count }
				/>
				<SidebarMenu>
					<ul>
						{ this.stats() }
						{ this.ads() }
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
			</Sidebar>
		);
	}
} );
