import config from '@automattic/calypso-config';
import { isEcommercePlan } from '@automattic/calypso-products/src';
import page from '@automattic/calypso-router';
import { PromptIcon } from '@automattic/command-palette';
import { Button, Popover } from '@automattic/components';
import { isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import { Icon, category } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { parse } from 'qs';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Site from 'calypso/blocks/site';
import AsyncLoad from 'calypso/components/async-load';
import Gravatar from 'calypso/components/gravatar';
import { getStatsPathForTab } from 'calypso/lib/route';
import wpcom from 'calypso/lib/wp';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { preload } from 'calypso/sections-helper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { openCommandPalette } from 'calypso/state/command-palette/actions';
import { isCommandPaletteOpen as getIsCommandPaletteOpen } from 'calypso/state/command-palette/selectors';
import {
	getCurrentUser,
	getCurrentUserDate,
	getCurrentUserSiteCount,
} from 'calypso/state/current-user/selectors';
import {
	getShouldShowGlobalSidebar,
	getShouldShowSiteDashboard,
	getShouldShowUnifiedSiteSidebar,
} from 'calypso/state/global-sidebar/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, isFetchingPreferences } from 'calypso/state/preferences/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getSiteMigrationStatus from 'calypso/state/selectors/get-site-migration-status';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteMigrationActiveRoute from 'calypso/state/selectors/is-site-migration-active-route';
import isSiteMigrationInProgress from 'calypso/state/selectors/is-site-migration-in-progress';
import { updateSiteMigrationMeta } from 'calypso/state/sites/actions';
import { isTrialExpired } from 'calypso/state/sites/plans/selectors/trials/trials-expiration';
import {
	getSiteSlug,
	isJetpackSite,
	getSitePlanSlug,
	getSiteTitle,
	getSiteUrl,
	getSiteAdminUrl,
} from 'calypso/state/sites/selectors';
import canCurrentUserUseCustomerHome from 'calypso/state/sites/selectors/can-current-user-use-customer-home';
import { isSupportSession } from 'calypso/state/support/selectors';
import { activateNextLayoutFocus, setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { getSectionGroup, getSectionName, getSelectedSiteId } from 'calypso/state/ui/selectors';
import Item from './item';
import Masterbar from './masterbar';
import { MasterBarMobileMenu } from './masterbar-menu';
import Notifications from './masterbar-notifications/notifications-button';

const NEW_MASTERBAR_SHIPPING_DATE = new Date( 2022, 3, 14 ).getTime();
const MENU_POPOVER_PREFERENCE_KEY = 'dismissible-card-masterbar-collapsable-menu-popover';

const MOBILE_BREAKPOINT = '<480px';
const IS_RESPONSIVE_MENU_BREAKPOINT = '<782px';

class MasterbarLoggedIn extends Component {
	state = {
		isActionSearchVisible: false,
		isMenuOpen: false,
		isMobile: isWithinBreakpoint( MOBILE_BREAKPOINT ),
		isResponsiveMenu: isWithinBreakpoint( IS_RESPONSIVE_MENU_BREAKPOINT ),
		// making the ref a state triggers a re-render when it changes (needed for popover)
		menuBtnRef: null,
	};

	static propTypes = {
		user: PropTypes.object.isRequired,
		domainOnlySite: PropTypes.bool,
		section: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		setNextLayoutFocus: PropTypes.func.isRequired,
		currentLayoutFocus: PropTypes.string,
		siteSlug: PropTypes.string,
		isEcommerce: PropTypes.bool,
		isCheckout: PropTypes.bool,
		isCheckoutPending: PropTypes.bool,
		isCheckoutFailed: PropTypes.bool,
		isInEditor: PropTypes.bool,
		hasDismissedThePopover: PropTypes.bool,
		isUserNewerThanNewNavigation: PropTypes.bool,
		loadHelpCenterIcon: PropTypes.bool,
		shouldShowSiteDashboard: PropTypes.bool,
	};

	subscribeToViewPortChanges() {
		this.unsubscribeToViewPortChanges = subscribeIsWithinBreakpoint(
			MOBILE_BREAKPOINT,
			( isMobile ) => this.setState( { isMobile } )
		);
		this.unsubscribeResponsiveMenuViewPortChanges = subscribeIsWithinBreakpoint(
			IS_RESPONSIVE_MENU_BREAKPOINT,
			( isResponsiveMenu ) => this.setState( { isResponsiveMenu } )
		);
	}

	handleLayoutFocus = ( currentSection ) => {
		if ( currentSection !== this.props.section ) {
			// When current section is not focused then open the sidebar.
			this.props.setNextLayoutFocus( 'sidebar' );
		} else {
			// When current section is focused then open or close the sidebar depending on current state.
			'sidebar' === this.props.currentLayoutFocus
				? this.props.setNextLayoutFocus( 'content' )
				: this.props.setNextLayoutFocus( 'sidebar' );
		}
	};

	componentDidMount() {
		// Give a chance to direct URLs to open the sidebar on page load ( eg by clicking 'me' in wp-admin ).
		const qryString = parse( document.location.search.replace( /^\?/, '' ) );
		if ( qryString?.openSidebar === 'true' ) {
			this.props.setNextLayoutFocus( 'sidebar' );
		}
		this.actionSearchShortCutListener = () => {
			if ( event.ctrlKey && event.shiftKey && event.key === 'F' ) {
				this.clickSearchActions();
			}
		};
		document.addEventListener( 'keydown', this.actionSearchShortCutListener );
		this.subscribeToViewPortChanges();
	}

	componentWillUnmount() {
		document.removeEventListener( 'keydown', this.actionSearchShortCutListener );
		this.unsubscribeToViewPortChanges?.();
		this.unsubscribeResponsiveMenuViewPortChanges?.();
	}

	handleToggleMobileMenu = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_menu_clicked' );
		// this.handleLayoutFocus( 'sites' );
		if ( 'sidebar' === this.props.currentLayoutFocus ) {
			this.props.setNextLayoutFocus( 'content' );
		} else {
			this.props.setNextLayoutFocus( 'sidebar' );
		}
		this.props.activateNextLayoutFocus();
	};

	clickMySites = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_my_sites_clicked' );

		if ( this.props.isMobileGlobalNavVisible ) {
			// Fall through to navigate to /sites
			return;
		}

		this.handleLayoutFocus( 'sites' );
		this.props.activateNextLayoutFocus();

		/**
		 * Site Migration: Reset a failed migration when clicking on My Sites
		 *
		 * If the site migration has failed, clicking on My Sites sends the customer in a loop
		 * until they click the Try Again button on the migration screen.
		 *
		 * This code makes it possible to reset the failed migration state when clicking My Sites too.
		 */
		const { migrationStatus, currentSelectedSiteId } = this.props;

		if ( currentSelectedSiteId && migrationStatus === 'error' ) {
			/**
			 * Reset the in-memory site lock for the currently selected site
			 */
			this.props.updateSiteMigrationMeta( currentSelectedSiteId, 'inactive', null, null );

			/**
			 * Reset the migration on the backend
			 */
			wpcom.req
				.post( {
					path: `/sites/${ currentSelectedSiteId }/reset-migration`,
					apiNamespace: 'wpcom/v2',
				} )
				.catch( () => {} );
		}
	};

	clickReader = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_reader_clicked' );
		this.handleLayoutFocus( 'reader' );
	};

	clickMe = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_me_clicked' );
		window.scrollTo( 0, 0 );
		this.handleLayoutFocus( 'me' );
	};

	clickSearchActions = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_search_actions_clicked' );
		this.handleLayoutFocus( 'search-actions' );
		this.setState( { isActionSearchVisible: true } );
	};

	onSearchActionsClose = () => {
		this.setState( { isActionSearchVisible: false } );
	};

	preloadMySites = () => {
		preload( this.props.domainOnlySite ? 'domains' : 'stats' );
	};

	preloadAllSites = () => {
		preload( 'sites' );
	};

	preloadReader = () => {
		preload( 'reader' );
	};

	preloadMe = () => {
		preload( 'me' );
	};

	goToCheckout = ( siteId ) => {
		this.props.recordTracksEvent( 'calypso_masterbar_cart_go_to_checkout' );
		page( `/checkout/${ siteId }` );
	};

	onRemoveCartProduct = ( uuid = 'coupon' ) => {
		this.props.recordTracksEvent( 'calypso_masterbar_cart_remove_product', { uuid } );
	};

	isActive = ( section ) => {
		return section === this.props.section && ! this.props.isNotificationsShowing;
	};

	isSidebarOpen = () => {
		return 'sidebar' === this.props.currentLayoutFocus;
	};

	wordpressIcon = () => {
		// WP icon replacement for "horizon" environment
		if ( config( 'hostname' ) === 'horizon.wordpress.com' ) {
			return 'my-sites-horizon';
		}

		return 'my-sites';
	};

	/**
	 * Hamburger menu used by the global nav.
	 * In nav unification, the menu is openned with the Sites button
	 */
	renderSidebarMobileMenu() {
		const { translate } = this.props;
		return (
			<Item
				tipTarget="Menu"
				icon={ <span className="dashicons-before dashicons-menu-alt" /> }
				onClick={ this.handleToggleMobileMenu }
				isActive={ this.isSidebarOpen() }
				className="masterbar__item-sidebar-menu"
				tooltip={ translate( 'Menu' ) }
			/>
		);
	}

	renderGlobalMySites() {
		const { translate, section } = this.props;
		const { isResponsiveMenu } = this.state;

		let mySitesUrl = '/sites';

		const icon =
			this.state.isMobile && this.props.isInEditor ? 'chevron-left' : this.wordpressIcon();

		if ( 'sites-dashboard' === section && isResponsiveMenu ) {
			mySitesUrl = '';
		}

		return (
			<Item
				url={ mySitesUrl }
				tipTarget="my-sites"
				icon={ icon }
				onClick={ this.clickMySites }
				isActive={ this.isActive( 'sites-dashboard' ) && ! this.isSidebarOpen() }
				tooltip={ translate( 'Manage your sites' ) }
			/>
		);
	}

	getHomeUrl() {
		const { hasNoSites, siteSlug, isCustomerHomeEnabled, isSiteTrialExpired } = this.props;
		// eslint-disable-next-line no-nested-ternary
		return hasNoSites || isSiteTrialExpired
			? '/sites'
			: isCustomerHomeEnabled
			? `/home/${ siteSlug }`
			: getStatsPathForTab( 'day', siteSlug );
	}

	// will render as back button on mobile and in editor
	renderMySites() {
		const { domainOnlySite, siteSlug, translate, section, currentRoute } = this.props;
		const { isMenuOpen, isResponsiveMenu } = this.state;

		const homeUrl = this.getHomeUrl();

		let mySitesUrl = domainOnlySite
			? domainManagementList( siteSlug, currentRoute, true )
			: homeUrl;

		const icon =
			this.state.isMobile && this.props.isInEditor ? 'chevron-left' : this.wordpressIcon();

		if ( 'sites' === section && isResponsiveMenu ) {
			mySitesUrl = '';
		}

		if ( config.isEnabled( 'layout/mb' ) ) {
			mySitesUrl = '/sites';
		}

		let isActive = this.isActive( 'sites' ) && ! isMenuOpen;

		if ( config.isEnabled( 'layout/mb' ) ) {
			isActive = section === 'sites-dashboard';
		}

		if ( ! siteSlug && section === 'sites-dashboard' ) {
			// we are the /sites page but there is no site. Disable the home link
			return <Item icon={ icon } disabled />;
		}

		return (
			<Item
				className="masterbar__item-my-sites"
				url={ mySitesUrl }
				tipTarget="my-sites"
				icon={ icon }
				onClick={ this.clickMySites }
				isActive={ isActive }
				tooltip={ translate( 'Manage your sites' ) }
				preloadSection={ this.preloadMySites }
			/>
		);
	}

	handleToggleMenu = () => {
		this.setState( ( state ) => ( { isMenuOpen: ! state.isMenuOpen } ) );
	};

	dismissPopover = () => {
		this.props.savePreference( MENU_POPOVER_PREFERENCE_KEY, true );
	};

	renderCheckout() {
		const {
			isCheckoutPending,
			isCheckoutFailed,
			previousPath,
			currentSelectedSiteSlug,
			isJetpackNotAtomic,
			title,
			loadHelpCenterIcon,
		} = this.props;

		return (
			<AsyncLoad
				require="calypso/layout/masterbar/checkout"
				placeholder={ null }
				title={ title }
				isJetpackNotAtomic={ isJetpackNotAtomic }
				previousPath={ previousPath }
				siteSlug={ currentSelectedSiteSlug }
				isLeavingAllowed={ ! isCheckoutPending }
				shouldClearCartWhenLeaving={ ! isCheckoutFailed }
				loadHelpCenterIcon={ loadHelpCenterIcon }
			/>
		);
	}

	renderSiteMenu() {
		const { sectionGroup, currentSelectedSiteSlug, translate, siteTitle, siteUrl } = this.props;

		// Only display on site-specific pages.
		if ( sectionGroup !== 'sites' || ! currentSelectedSiteSlug ) {
			return null;
		}

		return (
			<>
				<Item
					className="masterbar__item-my-site"
					url={ siteUrl }
					icon={ <span className="dashicons-before dashicons-admin-home" /> }
					tipTarget="Menu"
					subItems={ [ { label: translate( 'Visit your site' ), url: siteUrl } ] }
				>
					{ siteTitle }
				</Item>
			</>
		);
	}

	renderSiteActionMenu() {
		const { sectionGroup, currentSelectedSiteSlug, translate, siteUrl } = this.props;

		// Only display on site-specific pages.
		if ( sectionGroup !== 'sites' || ! currentSelectedSiteSlug ) {
			return null;
		}

		const siteActions = [
			{
				label: translate( 'Post' ),
				url: siteUrl,
			},
			{
				label: translate( 'Media' ),
				url: siteUrl,
			},
			{
				label: translate( 'Page' ),
				url: siteUrl,
			},
			{
				label: translate( 'User' ),
				url: siteUrl,
			},
		];
		return (
			<>
				<Item
					className="masterbar__item-my-site-actions"
					url={ siteUrl }
					subItems={ siteActions }
					icon={ <span className="dashicons-before dashicons-plus" /> }
					tooltip={ translate( 'New' ) }
					tipTarget="Menu"
				>
					{ translate( 'New' ) }
				</Item>
			</>
		);
	}

	renderProfileMenu() {
		const { translate, user, siteUrl } = this.props;
		// todo: needs aligning with wp-admin side
		const profileActions = [
			{
				// todo: support: toplabel: user.display_name,
				label: translate( 'Edit WordPress.com Profile' ),
				url: '/me',
			},
			{
				label: translate( 'Edit Site Profile' ),
				url: siteUrl + '/wp-admin/profile.php',
			},
			{
				label: translate( 'Log Out' ),
				// todo: support: onClick: dispatch(redirectToLogout()),
				url: 'https://wordpress.com/wp-login.php?action=logout',
				// todo: support tooltip: translate( 'Log out of WordPress.com' ),
			},
		];
		return (
			<Item
				tipTarget="me"
				url="/me"
				onClick={ this.clickMe }
				isActive={ this.isActive( 'me' ) }
				className="masterbar__item-howdy"
				tooltip={ translate( 'Update your profile, personal settings, and more' ) }
				preloadSection={ this.preloadMe }
				subItems={ profileActions }
				// todo: support:
				/*subItemIcon={
					<Gravatar
						className="masterbar__item-howdy-gravatar"
						user={ user }
						alt={ translate( 'My Profile' ) }
						size={ 46 }
					/>
				}*/
			>
				<span className="masterbar__item-howdy-howdy">
					{ translate( 'Howdy, %(display_name)s', {
						args: { display_name: user.display_name },
					} ) }
				</span>
				<Gravatar
					className="masterbar__item-howdy-gravatar"
					user={ user }
					alt={ translate( 'My Profile' ) }
					size={ 18 }
				/>
			</Item>
		);
	}

	renderReader( showLabel = true ) {
		const { translate } = this.props;
		return (
			<Item
				tipTarget="reader"
				className="masterbar__reader"
				url="/read"
				icon="reader"
				onClick={ this.clickReader }
				isActive={ this.isActive( 'reader' ) }
				tooltip={ translate( 'Read the blogs and topics you follow' ) }
				preloadSection={ this.preloadReader }
			>
				{ showLabel &&
					translate( 'Reader', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
			</Item>
		);
	}

	renderLanguageSwitcher() {
		if ( this.props.isSupportSession || config.isEnabled( 'quick-language-switcher' ) ) {
			return <AsyncLoad require="./quick-language-switcher" placeholder={ null } />;
		}
		return null;
	}

	renderSearch() {
		const { translate, isWordPressActionSearchFeatureEnabled } = this.props;
		if ( isWordPressActionSearchFeatureEnabled ) {
			return (
				<Item
					tipTarget="Action Search"
					icon="search"
					onClick={ this.clickSearchActions }
					isActive={ false }
					className="masterbar__item-action-search"
					tooltip={ translate( 'Search' ) }
					preloadSection={ this.preloadMe }
				>
					{ translate( 'Search Actions' ) }
				</Item>
			);
		}
		return null;
	}

	renderPublish() {
		const { domainOnlySite, translate, isMigrationInProgress, isEcommerce } = this.props;
		if ( ! domainOnlySite && ! isMigrationInProgress && ! isEcommerce ) {
			return (
				<AsyncLoad
					require="./publish"
					placeholder={ null }
					isActive={ this.isActive( 'post' ) }
					className="masterbar__item-new"
					tooltip={ translate( 'Create a New Post' ) }
				>
					{ translate( 'Write' ) }
				</AsyncLoad>
			);
		}
		return null;
	}

	renderCart() {
		const { currentSelectedSiteSlug, currentSelectedSiteId, sectionGroup } = this.props;
		// Only display the masterbar cart when we are viewing a site-specific page.
		if ( sectionGroup !== 'sites' ) {
			return null;
		}
		return (
			<AsyncLoad
				require="./masterbar-cart/masterbar-cart-wrapper"
				placeholder={ null }
				goToCheckout={ this.goToCheckout }
				onRemoveProduct={ this.onRemoveCartProduct }
				onRemoveCoupon={ this.onRemoveCartProduct }
				selectedSiteSlug={ currentSelectedSiteSlug }
				selectedSiteId={ currentSelectedSiteId }
			/>
		);
	}

	renderMe() {
		const { isMobile } = this.state;
		const { translate, user } = this.props;
		return (
			<Item
				tipTarget="me"
				url="/me"
				icon={ isMobile ? null : 'user-circle' }
				onClick={ this.clickMe }
				isActive={ this.isActive( 'me' ) }
				className="masterbar__item-me"
				tooltip={ translate( 'Update your profile, personal settings, and more' ) }
				preloadSection={ this.preloadMe }
			>
				<Gravatar
					className="masterbar__item-me-gravatar"
					user={ user }
					alt={ translate( 'My Profile' ) }
					size={ 18 }
				/>
				<span className="masterbar__item-me-label">
					{ translate( 'My Profile', {
						context: 'Toolbar, must be shorter than ~12 chars',
					} ) }
				</span>
			</Item>
		);
	}

	renderNotifications() {
		const { translate } = this.props;
		return (
			<Notifications
				isShowing
				isActive={ this.isActive( 'notifications' ) }
				className="masterbar__item-notifications"
				tooltip={ translate( 'Manage your notifications' ) }
			>
				<span className="masterbar__item-notifications-label">
					{ translate( 'Notifications', {
						comment: 'Toolbar, must be shorter than ~12 chars',
					} ) }
				</span>
			</Notifications>
		);
	}

	renderCommandPaletteSearch() {
		const handleClick = () => {
			this.props.recordTracksEvent( 'calypso_masterbar_command_palette_search_clicked' );
			this.props.openCommandPalette();
		};

		return (
			<Item
				className="masterbar__item-menu"
				icon={ <PromptIcon /> }
				tooltip={ this.props.translate( 'Command Palette' ) }
				isActive={ this.props.isCommandPaletteOpen }
				onClick={ handleClick }
			/>
		);
	}

	renderMenu() {
		const { menuBtnRef } = this.state;
		const { translate, hasDismissedThePopover, isFetchingPrefs, isUserNewerThanNewNavigation } =
			this.props;
		return (
			<>
				<Item
					tipTarget="Menu"
					icon="menu"
					onClick={ this.handleToggleMenu }
					isActive={ this.state.isMenuOpen }
					className="masterbar__item-menu"
					tooltip={ translate( 'Menu' ) }
					ref={ ( ref ) => ref !== menuBtnRef && this.setState( { menuBtnRef: ref } ) }
				/>
				<MasterBarMobileMenu onClose={ this.handleToggleMenu } open={ this.state.isMenuOpen }>
					{ this.renderPublish() }
					{ this.renderMe() }
				</MasterBarMobileMenu>
				{ menuBtnRef && (
					<Popover
						className="masterbar__new-menu-popover"
						isVisible={
							! isFetchingPrefs && ! hasDismissedThePopover && ! isUserNewerThanNewNavigation
						}
						context={ menuBtnRef }
						onClose={ this.dismissPopover }
						position="bottom left"
						showDelay={ 500 }
					>
						<div className="masterbar__new-menu-popover-inner">
							<h1>
								{ translate( '👆 New top navigation', {
									comment: 'This is a popover title under the masterbar',
								} ) }
							</h1>
							<p>{ translate( 'We changed the navigation for a cleaner experience.' ) }</p>
							<div className="masterbar__new-menu-popover-actions">
								<Button onClick={ this.dismissPopover }>
									{ translate( 'Got it', { comment: 'Got it, as in OK' } ) }
								</Button>
							</div>
						</div>
					</Popover>
				) }
			</>
		);
	}

	renderPopupSearch() {
		const isWordPressActionSearchFeatureEnabled = config.isEnabled( 'wordpress-action-search' );
		const { isActionSearchVisible } = this.state;

		if ( ! isWordPressActionSearchFeatureEnabled || ! isActionSearchVisible ) {
			return null;
		}

		return (
			<AsyncLoad
				require="calypso/layout/popup-search"
				placeholder={ null }
				onClose={ this.onSearchActionsClose }
			/>
		);
	}

	renderHelpCenter() {
		const { currentSelectedSiteId, translate } = this.props;

		return (
			<AsyncLoad
				require="./masterbar-help-center"
				siteId={ currentSelectedSiteId }
				tooltip={ translate( 'Help' ) }
				placeholder={ null }
			/>
		);
	}

	renderLaunchpadNavigator() {
		if ( config.isEnabled( 'launchpad/navigator' ) ) {
			return <AsyncLoad require="./masterbar-launchpad-navigator" />;
		}

		return null;
	}

	renderWordPressIcon() {
		const { siteAdminUrl } = this.props;
		return (
			<Item
				url={ siteAdminUrl }
				className="masterbar__item-wordpress"
				icon={ <span className="dashicons-before dashicons-wordpress" /> }
			/>
		);
	}

	renderAllSites() {
		const { translate } = this.props;
		return (
			<Item
				url="/sites"
				className="masterbar__item-all-sites"
				tipTarget="my-sites"
				icon={ <Icon icon={ category } /> }
				tooltip={ translate( 'Manage your sites' ) }
				preloadSection={ this.preloadAllSites }
			>
				{ translate( 'All Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
			</Item>
		);
	}

	renderCurrentSite() {
		const { translate, siteTitle, siteUrl } = this.props;
		return (
			<Item
				className="masterbar__item-current-site"
				url={ siteUrl }
				icon={ <span className="dashicons-before dashicons-admin-home" /> }
				tooltip={ translate( 'Visit your site' ) }
			>
				{ siteTitle }
			</Item>
		);
	}

	render() {
		const {
			isInEditor,
			isCheckout,
			isCheckoutPending,
			isCheckoutFailed,
			loadHelpCenterIcon,
			currentSelectedSiteId,
			isSiteDashboardView,
		} = this.props;
		const { isMobile } = this.state;

		if ( isCheckout || isCheckoutPending || isCheckoutFailed ) {
			return this.renderCheckout();
		}

		if ( config.isEnabled( 'layout/mb' ) ) {
			if ( isMobile ) {
				if ( isInEditor && loadHelpCenterIcon ) {
					return (
						<Masterbar>
							<div className="masterbar__section masterbar__section--left">
								{ this.renderMySites() }
							</div>
							<div className="masterbar__section masterbar__section--right">
								{ this.renderCart() }
								{ this.renderNotifications() }
							</div>
						</Masterbar>
					);
				}
				return (
					<>
						{ this.renderPopupSearch() }
						<Masterbar>
							<div className="masterbar__section masterbar__section--left">
								{ this.renderSidebarMobileMenu() }
								{ this.renderMySites() }
								{ this.renderReader( false ) }
								{ this.renderSiteMenu() }
								{ this.renderSiteActionMenu() }
								{ this.renderLanguageSwitcher() }
								{ this.renderSearch() }
							</div>
							<div className="masterbar__section masterbar__section--right">
								{ this.renderCart() }
								{ loadHelpCenterIcon && this.renderHelpCenter() }
								{ this.renderNotifications() }
								{ this.renderProfileMenu() }
							</div>
						</Masterbar>
					</>
				);
			}
			return (
				<>
					{ this.renderPopupSearch() }
					<Masterbar>
						<div className="masterbar__section masterbar__section--left">
							{ this.renderMySites() }
							{ this.renderReader() }
							{ this.renderSiteMenu() }
							{ this.renderSiteActionMenu() }
							{ this.renderLanguageSwitcher() }
							{ this.renderSearch() }
						</div>
						<div className="masterbar__section masterbar__section--right">
							{ this.renderCart() }
							{ this.renderLaunchpadNavigator() }
							{ loadHelpCenterIcon && this.renderHelpCenter() }
							{ this.renderNotifications() }
							{ this.renderProfileMenu() }
						</div>
					</Masterbar>
				</>
			);
		}

		if ( this.props.isMobileGlobalNavVisible ) {
			return (
				<>
					<Masterbar className="masterbar__global-nav">
						<div className="masterbar__section masterbar__section--left">
							{ this.renderSidebarMobileMenu() }
							{ this.renderGlobalMySites() }
							{ isSiteDashboardView && currentSelectedSiteId && (
								<Site
									siteId={ currentSelectedSiteId }
									href={ this.getHomeUrl() }
									isSelected
									inlineBadges
								/>
							) }
						</div>
						<div className="masterbar__section masterbar__section--right">
							{ this.renderSearch() }
							{ this.renderCart() }
							{ this.renderCommandPaletteSearch() }
							{ this.renderNotifications() }
						</div>
					</Masterbar>
				</>
			);
		}

		if ( this.props.isUnifiedSiteView ) {
			return (
				<Masterbar className="masterbar__unified">
					<div className="masterbar__section masterbar__section--left">
						{ this.state.isResponsiveMenu
							? this.renderSidebarMobileMenu()
							: this.renderWordPressIcon() }
						{ this.renderAllSites() }
						{ this.renderCurrentSite() }
					</div>
					<div className="masterbar__section masterbar__section--right">
						{ this.renderCart() }
						{ loadHelpCenterIcon && this.renderHelpCenter() }
						{ this.renderNotifications() }
						{ this.renderMe() }
					</div>
				</Masterbar>
			);
		}

		if ( isMobile ) {
			if ( isInEditor && loadHelpCenterIcon ) {
				return (
					<Masterbar>
						<div className="masterbar__section masterbar__section--left">
							{ this.renderMySites() }
						</div>
						<div className="masterbar__section masterbar__section--right">
							{ this.renderCart() }
							{ this.renderNotifications() }
						</div>
					</Masterbar>
				);
			}
			return (
				<>
					{ this.renderPopupSearch() }
					<Masterbar>
						<div className="masterbar__section masterbar__section--left">
							{ this.renderMySites() }
							{ this.renderReader( false ) }
							{ this.renderLanguageSwitcher() }
							{ this.renderSearch() }
						</div>
						<div className="masterbar__section masterbar__section--right">
							{ this.renderCart() }
							{ this.renderNotifications() }
							{ loadHelpCenterIcon && this.renderHelpCenter() }
							{ this.renderMenu() }
						</div>
					</Masterbar>
				</>
			);
		}
		return (
			<>
				{ this.renderPopupSearch() }
				<Masterbar>
					<div className="masterbar__section masterbar__section--left">
						{ this.renderMySites() }
						{ this.renderReader() }
						{ this.renderLanguageSwitcher() }
						{ this.renderSearch() }
					</div>
					<div className="masterbar__section masterbar__section--center">
						{ this.renderPublish() }
					</div>
					<div className="masterbar__section masterbar__section--right">
						{ this.renderCart() }
						{ this.renderMe() }
						{ loadHelpCenterIcon && this.renderHelpCenter() }
						{ this.renderLaunchpadNavigator() }
						{ this.renderNotifications() }
					</div>
				</Masterbar>
			</>
		);
	}
}

export default connect(
	( state ) => {
		const sectionGroup = getSectionGroup( state );
		const sectionName = getSectionName( state );

		// Falls back to using the user's primary site if no site has been selected
		// by the user yet
		const currentSelectedSiteId = getSelectedSiteId( state );
		const siteId = currentSelectedSiteId || getPrimarySiteId( state );
		const sitePlanSlug = getSitePlanSlug( state, siteId );
		const isMigrationInProgress =
			isSiteMigrationInProgress( state, currentSelectedSiteId ) ||
			isSiteMigrationActiveRoute( state );

		const siteCount = getCurrentUserSiteCount( state ) ?? 0;
		const shouldShowGlobalSidebar = getShouldShowGlobalSidebar(
			state,
			currentSelectedSiteId,
			sectionGroup,
			sectionName
		);
		const shouldShowSiteDashboard = getShouldShowSiteDashboard(
			state,
			currentSelectedSiteId,
			sectionGroup,
			sectionName
		);
		const shouldShowUnifiedSiteSidebar = getShouldShowUnifiedSiteSidebar(
			state,
			currentSelectedSiteId,
			sectionGroup,
			sectionName
		);
		const isDesktop = isWithinBreakpoint( '>782px' );
		return {
			isCustomerHomeEnabled: canCurrentUserUseCustomerHome( state, siteId ),
			isNotificationsShowing: isNotificationsOpen( state ),
			isEcommerce: isEcommercePlan( sitePlanSlug ),
			siteSlug: getSiteSlug( state, siteId ),
			siteTitle: getSiteTitle( state, siteId ),
			siteUrl: getSiteUrl( state, siteId ),
			siteAdminUrl: getSiteAdminUrl( state, siteId ),
			sectionGroup,
			domainOnlySite: isDomainOnlySite( state, siteId ),
			hasNoSites: siteCount === 0,
			user: getCurrentUser( state ),
			isSupportSession: isSupportSession( state ),
			isInEditor: getSectionName( state ) === 'gutenberg-editor',
			isMigrationInProgress,
			migrationStatus: getSiteMigrationStatus( state, currentSelectedSiteId ),
			currentSelectedSiteId,
			currentSelectedSiteSlug: currentSelectedSiteId
				? getSiteSlug( state, currentSelectedSiteId )
				: undefined,
			previousPath: getPreviousRoute( state ),
			isJetpackNotAtomic:
				isJetpackSite( state, currentSelectedSiteId ) &&
				! isAtomicSite( state, currentSelectedSiteId ),
			currentLayoutFocus: getCurrentLayoutFocus( state ),
			hasDismissedThePopover: getPreference( state, MENU_POPOVER_PREFERENCE_KEY ),
			isFetchingPrefs: isFetchingPreferences( state ),
			// If the user is newer than new navigation shipping date, don't tell them this nav is new. Everything is new to them.
			isUserNewerThanNewNavigation:
				new Date( getCurrentUserDate( state ) ).getTime() > NEW_MASTERBAR_SHIPPING_DATE,
			currentRoute: getCurrentRoute( state ),
			isSiteTrialExpired: isTrialExpired( state, siteId ),
			isMobileGlobalNavVisible: shouldShowGlobalSidebar && ! isDesktop,
			isSiteDashboardView: shouldShowSiteDashboard,
			isUnifiedSiteView: shouldShowUnifiedSiteSidebar,
			isCommandPaletteOpen: getIsCommandPaletteOpen( state ),
		};
	},
	{
		setNextLayoutFocus,
		recordTracksEvent,
		updateSiteMigrationMeta,
		activateNextLayoutFocus,
		savePreference,
		openCommandPalette,
	}
)( localize( MasterbarLoggedIn ) );
