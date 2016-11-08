/**
 * External dependencies
 */
import analytics from 'lib/analytics';
import classNames from 'classnames';
import debugFactory from 'debug';
import { has, includes } from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import CurrentSite from 'my-sites/current-site';
import { getCustomizeUrl } from '../themes/helpers';
import Gridicon from 'components/gridicon';
import productsValues from 'lib/products-values';
import PublishMenu from './publish-menu';
import Sidebar from 'layout/sidebar';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import SiteStatsStickyLink from 'components/site-stats-sticky-link';

import Button from 'components/button';
import SidebarButton from 'layout/sidebar/button';
import SidebarFooter from 'layout/sidebar/footer';
import { isPersonal, isPremium, isBusiness } from 'lib/products-values';
import { getCurrentUser } from 'state/current-user/selectors';
import { setNextLayoutFocus, setLayoutFocus } from 'state/ui/layout-focus/actions';

const debug = debugFactory( 'calypso:my-sites:sidebar' );

export const MySitesSidebar = React.createClass( {
	propTypes: {
		setNextLayoutFocus: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		path: PropTypes.string,
		sites: PropTypes.object,
		currentUser: PropTypes.object,
	},

	componentDidMount: function() {
		debug( 'The sidebar React component is mounted.' );
	},

	onNavigate: function() {
		this.props.setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );
	},

	onPreviewSite( event ) {
		const site = this.getSelectedSite();
		if ( site.is_previewable && ! event.metaKey && ! event.ctrlKey ) {
			event.preventDefault();
			this.props.setLayoutFocus( 'preview' );
		}
	},

	itemLinkClass: function( paths, existingClasses ) {
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

	renderPublishMenu: function() {
		return (
			<PublishMenu site={ this.getSelectedSite() }
				sites={ this.props.sites }
				siteSuffix={ this.siteSuffix() }
				isSingle={ this.isSingle() }
				itemLinkClass={ this.itemLinkClass }
				onNavigate={ this.onNavigate } />
		);
	},

	renderStatsOption: function() {
		const site = this.getSelectedSite();

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

	renderAdsOption: function() {
		const site = this.getSelectedSite();

		if ( ! site || ! site.options.wordads ) {
			return null;
		}

		const link = '/ads/earnings' + this.siteSuffix();

		return (
			<SidebarItem
				label={ site.jetpack ? 'AdControl' : 'WordAds' }
				className={ this.itemLinkClass( '/ads', 'rads' ) }
				link={ link }
				onNavigate={ this.onNavigate }
				icon="speaker" />
		);
	},

	renderThemesOption: function() {
		const site = this.getSelectedSite();
		let link;

		if ( site && ! site.isCustomizable() ) {
			return null;
		}

		if ( ! config.isEnabled( 'manage/themes' ) ) {
			return null;
		}

		const jetpackEnabled = config.isEnabled( 'manage/themes-jetpack' );

		if ( site.jetpack && ! jetpackEnabled && site.options ) {
			link = site.options.admin_url + 'themes.php';
		} else if ( this.isSingle() ) {
			link = '/design' + this.siteSuffix();
		} else {
			link = '/design';
		}

		return (
			<SidebarItem
				label={ this.translate( 'Themes' ) }
				tipTarget="themes"
				className={ this.itemLinkClass( '/design', 'themes' ) }
				link={ link }
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

	renderMenusOption: function() {
		const site = this.getSelectedSite();

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

		const showClassicLink = ! config.isEnabled( 'manage/menus' );
		const link = showClassicLink
			? site.options.admin_url + 'nav-menus.php'
			: '/menus' + this.siteSuffix();

		return (
			<SidebarItem
				tipTarget="menus"
				label={ this.translate( 'Menus' ) }
				className={ this.itemLinkClass( '/menus', 'menus' ) }
				link={ link }
				onNavigate={ this.onNavigate }
				icon="menus"
				preloadSectionName="menus" />
		);
	},

	renderPluginsOption: function() {
		const site = this.getSelectedSite();
		const isSingleSite = this.isSingle();
		let pluginsLink = '/plugins' + this.siteSuffix();
		let addPluginsLink;

		if ( ! config.isEnabled( 'manage/plugins' ) ) {
			if ( ! isSingleSite ) {
				return null;
			}

			if ( site.options ) {
				pluginsLink = site.options.admin_url + 'plugins.php';
			}
		}

		if ( ! this.props.sites.canManageSelectedOrAll() ) {
			return null;
		}

		if ( ( isSingleSite && site.jetpack ) || ( ! isSingleSite && this.hasJetpackSites() ) ) {
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

	renderUpgradesOption: function() {
		const site = this.getSelectedSite();
		const siteSuffix = this.siteSuffix();
		const domainsLink = '/domains/manage' + siteSuffix;
		const addDomainLink = '/domains/add' + siteSuffix;

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

	renderPlanOption: function() {
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

	renderSharingOption: function() {
		const site = this.getSelectedSite();
		let sharingLink = '/sharing' + this.siteSuffix();

		if ( ! site.capabilities ) {
			return null;
		}

		if (
			site.jetpack &&
			! site.isModuleActive( 'publicize' ) &&
			( ! site.isModuleActive( 'sharedaddy' ) || site.versionCompare( '3.4-dev', '<' ) )
		) {
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

	renderUsersOption: function() {
		const site = this.getSelectedSite();
		const siteSuffix = this.siteSuffix();
		let usersLink = '/people/team' + siteSuffix;
		let addPeopleLink = '/people/new' + siteSuffix;

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

	renderSettingsOption: function() {
		const site = this.getSelectedSite();
		const siteSettingsLink = '/settings/general' + this.siteSuffix();

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

	renderWpAdminOption: function() {
		const site = this.getSelectedSite();
		const currentUser = this.props.currentUser;

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
				<a onClick={ this.trackWpadminClick } href={ site.options.admin_url } target="_blank" rel="noopener noreferrer">
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

	renderVipUpdatesOption: function() {
		if ( ! config.isEnabled( 'vip' ) ) {
			return null;
		}

		const site = this.getSelectedSite();

		if ( ! site ) {
			return null;
		}

		const link = '/vip/updates' + this.siteSuffix();

		return (
			<li className={ this.itemLinkClass( '/vip/updates', 'sidebar__vip' ) } >
				<a href={ link } >
					<span className="menu-link-text">{ this.translate( 'Updates' ) }</span>
				</a>
			</li>
		);
	},

	renderVipDeploysOption: function() {
		if ( ! config.isEnabled( 'vip/deploys' ) ) {
			return null;
		}

		const site = this.getSelectedSite();

		if ( ! site ) {
			return null;
		}

		const link = '/vip/deploys' + this.siteSuffix();

		return (
			<li className={ this.itemLinkClass( '/vip/deploys', 'sidebar__vip-deploys' ) } >
				<a href={ link } >
					<span className="menu-link-text">{ this.translate( 'Deploys' ) }</span>
				</a>
			</li>
		);
	},

	renderVipBillingOption: function() {
		if ( ! config.isEnabled( 'vip/billing' ) ) {
			return null;
		}

		const site = this.getSelectedSite();

		if ( ! site ) {
			return null;
		}

		const link = '/vip/billing' + this.siteSuffix();

		return (
			<li className={ this.itemLinkClass( '/vip/billing', 'sidebar__vip-billing' ) }>
				<a href={ link } >
					<span className="menu-link-text">{ this.translate( 'Billing' ) }</span>
				</a>
			</li>
		);
	},

	renderVipSupportOption: function() {
		if ( ! config.isEnabled( 'vip/support' ) ) {
			return null;
		}

		const link = '/vip/support' + this.siteSuffix();

		return (
			<li className={ this.itemLinkClass( '/vip/support', 'sidebar__vip-support' ) }>
				<a href={ link } >
					<span className="menu-link-text">{ this.translate( 'Support' ) }</span>
				</a>
			</li>
		);
	},

	renderVipBackupsOption: function() {
		if ( ! config.isEnabled( 'vip/backups' ) ) {
			return null;
		}

		const site = this.getSelectedSite();

		if ( ! site ) {
			return null;
		}

		const link = '/vip/backups' + this.siteSuffix();

		return (
			<li className={ this.itemLinkClass( '/vip/backups', 'sidebar__vip-backups' ) }>
				<a href={ link } >
					<span className="menu-link-text">{ this.translate( 'Backups' ) }</span>
				</a>
			</li>
		);
	},

	renderVipLogsOption: function() {
		if ( ! config.isEnabled( 'vip/logs' ) ) {
			return null;
		}

		const site = this.getSelectedSite();

		if ( ! site ) {
			return null;
		}

		const link = '/vip/logs' + this.siteSuffix();

		return (
			<li className={ this.itemLinkClass( '/vip/logs', 'sidebar__vip-logs' ) }>
				<a href={ link } >
					<span className="menu-link-text">{ this.translate( 'Logs' ) }</span>
				</a>
			</li>
		);
	},

	focusContent: function() {
		this.props.setLayoutFocus( 'content' );
	},

	renderAddNewSiteButton: function() {
		if ( this.props.currentUser.visible_site_count > 1 ) {
			return null;
		}

		return (
			<Button borderless
				className="my-sites-sidebar__add-new-site"
				href={ config( 'signup_url' ) + '?ref=calypso-selector' }
				onClick={ this.focusContent }
			>
				<Gridicon icon="add-outline" /> { this.translate( 'Add New Site' ) }
			</Button>
		);
	},

	render: function() {
		const showPublishMenu = !! this.renderPublishMenu();
		const showAppearanceMenu = !! this.renderThemesOption() || !! this.renderMenusOption();
		const showConfigurationMenu = (
			!! this.renderSharingOption() ||
			!! this.renderUsersOption() ||
			!! this.renderSettingsOption() ||
			!! this.renderPluginsOption() ||
			!! this.renderUpgradesOption()
		);
		const showVipMenu = !! this.renderVipUpdatesOption();

		return (
			<Sidebar>
				<SidebarRegion>
				<CurrentSite
					sites={ this.props.sites }
					siteCount={ this.props.currentUser.visible_site_count }
					onClick={ this.onPreviewSite }
				/>
				<SidebarMenu>
					<ul>
						{ this.renderStatsOption() }
						{ this.renderPlanOption() }
					</ul>
				</SidebarMenu>

				{ showVipMenu && (
					<SidebarMenu>
						<SidebarHeading>VIP</SidebarHeading>
						<ul>
							{ this.renderVipUpdatesOption() }
							{ this.renderVipDeploysOption() }
							{ this.renderVipBillingOption() }
							{ this.renderVipSupportOption() }
							{ this.renderVipBackupsOption() }
							{ this.renderVipLogsOption() }
						</ul>
					</SidebarMenu>
				) }

				{ showPublishMenu && (
					<SidebarMenu>
						<SidebarHeading>{ this.translate( 'Publish' ) }</SidebarHeading>
						{ this.renderPublishMenu() }
					</SidebarMenu>
				) }

				{ showAppearanceMenu && (
					<SidebarMenu>
						<SidebarHeading>{ this.translate( 'Personalize' ) }</SidebarHeading>
						<ul>
							{ this.renderThemesOption() }
							{ this.renderMenusOption() }
						</ul>
					</SidebarMenu>
				) }

				{ showConfigurationMenu && (
					<SidebarMenu>
						<SidebarHeading>{ this.translate( 'Configure' ) }</SidebarHeading>
						<ul>
							{ this.renderAdsOption() }
							{ this.renderSharingOption() }
							{ this.renderUsersOption() }
							{ this.renderPluginsOption() }
							{ this.renderUpgradesOption() }
							{ this.renderSettingsOption() }
							{ this.renderWpAdminOption() }
						</ul>
					</SidebarMenu>
				) }

				</SidebarRegion>
				<SidebarFooter>
					{ this.renderAddNewSiteButton() }
				</SidebarFooter>
			</Sidebar>
		);
	}
} );

function mapStateToProps( state ) {
	return {
		currentUser: getCurrentUser( state ),
	};
}

// TODO: make this pure when sites can be retrieved from the Redux state
export default connect( mapStateToProps, { setNextLayoutFocus, setLayoutFocus }, null, { pure: false } )( MySitesSidebar );
