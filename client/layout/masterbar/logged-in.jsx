import config from '@automattic/calypso-config';
import { Popover, Button } from '@automattic/components';
import { subscribeIsWithinBreakpoint, isWithinBreakpoint } from '@automattic/viewport';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { parse } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import Gravatar from 'calypso/components/gravatar';
import { getStatsPathForTab } from 'calypso/lib/route';
import wpcom from 'calypso/lib/wp';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { preload } from 'calypso/sections-helper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserSiteCount, getCurrentUser } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getSiteMigrationStatus from 'calypso/state/selectors/get-site-migration-status';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteMigrationActiveRoute from 'calypso/state/selectors/is-site-migration-active-route';
import isSiteMigrationInProgress from 'calypso/state/selectors/is-site-migration-in-progress';
import { updateSiteMigrationMeta } from 'calypso/state/sites/actions';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import canCurrentUserUseCustomerHome from 'calypso/state/sites/selectors/can-current-user-use-customer-home';
import { isSupportSession } from 'calypso/state/support/selectors';
import { activateNextLayoutFocus, setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Item from './item';
import Masterbar from './masterbar';
import { MasterBarMobileMenu } from './masterbar-menu';
import Notifications from './notifications';

const MENU_POPOVER_PREFERENCE_KEY = 'dismissed-masterbar-collapsable-menu-popover';

const MOBILE_BREAKPOINT = '<480px';
class MasterbarLoggedIn extends Component {
	state = {
		isActionSearchVisible: false,
		isMenuOpen: false,
		isMobile: isWithinBreakpoint( MOBILE_BREAKPOINT ),
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
		hasMoreThanOneSite: PropTypes.bool,
		isCheckout: PropTypes.bool,
		isCheckoutPending: PropTypes.bool,
	};

	subscribeToViewPortChanges() {
		this.unsubscribeToViewPortChanges = subscribeIsWithinBreakpoint(
			MOBILE_BREAKPOINT,
			( isMobile ) => this.setState( { isMobile } )
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
	}

	clickMySites = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_my_sites_clicked' );
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
			this.props.updateSiteMigrationMeta( currentSelectedSiteId, 'inactive', null );

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

	wordpressIcon = () => {
		// WP icon replacement for "horizon" environment
		if ( config( 'hostname' ) === 'horizon.wordpress.com' ) {
			return 'my-sites-horizon';
		}

		return 'my-sites';
	};

	renderMySites() {
		const {
			domainOnlySite,
			hasMoreThanOneSite,
			siteSlug,
			translate,
			isCustomerHomeEnabled,
			section,
		} = this.props;
		const { isMenuOpen } = this.state;

		const homeUrl = isCustomerHomeEnabled
			? `/home/${ siteSlug }`
			: getStatsPathForTab( 'day', siteSlug );

		let mySitesUrl = domainOnlySite ? domainManagementList( siteSlug ) : homeUrl;
		if ( 'sites' === section ) {
			mySitesUrl = '';
		}
		return (
			<Item
				url={ mySitesUrl }
				tipTarget="my-sites"
				icon={ this.wordpressIcon() }
				onClick={ this.clickMySites }
				isActive={ this.isActive( 'sites' ) && ! isMenuOpen }
				tooltip={ translate( 'View a list of your sites and access their dashboards' ) }
				preloadSection={ this.preloadMySites }
			>
				{ hasMoreThanOneSite
					? translate( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
					: translate( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
			</Item>
		);
	}

	handleToggleMenu() {
		this.setState( { isMenuOpen: ! this.state.isMenuOpen } );
	}

	masterbarItemsMap() {
		const isWordPressActionSearchFeatureEnabled = config.isEnabled( 'wordpress-action-search' );
		const { isActionSearchVisible, isMobile, menuBtnRef } = this.state;

		const {
			domainOnlySite,
			translate,
			isCheckoutPending,
			isMigrationInProgress,
			previousPath,
			siteSlug,
			isJetpackNotAtomic,
			title,
			currentSelectedSiteSlug,
			currentSelectedSiteId,
			hasDismissedThePopover,
			dismissPopover,
			user,
		} = this.props;

		return {
			checkout: () => (
				<AsyncLoad
					require="calypso/layout/masterbar/checkout.tsx"
					placeholder={ null }
					title={ title }
					isJetpackNotAtomic={ isJetpackNotAtomic }
					previousPath={ previousPath }
					siteSlug={ siteSlug }
					isLeavingAllowed={ ! isCheckoutPending }
				/>
			),
			popupSearch: () =>
				isWordPressActionSearchFeatureEnabled && isActionSearchVisible ? (
					<AsyncLoad
						require="calypso/layout/popup-search"
						placeholder={ null }
						onClose={ this.onSearchActionsClose }
					/>
				) : null,
			mySites: () => this.renderMySites(),
			reader: () => (
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
					{ translate( 'Reader', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
				</Item>
			),
			languageSwitcher: () =>
				( this.props.isSupportSession || config.isEnabled( 'quick-language-switcher' ) ) && (
					<AsyncLoad require="./quick-language-switcher" placeholder={ null } />
				),
			search: () =>
				isWordPressActionSearchFeatureEnabled && (
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
				),
			planUpsell: () =>
				! domainOnlySite &&
				! isMigrationInProgress && (
					<AsyncLoad
						require="./plan-upsell"
						className="masterbar__item-upsell button is-primary"
						tooltip={ translate( 'Upgrade your plan' ) }
					>
						{ translate( 'Upgrade' ) }
					</AsyncLoad>
				),
			publish: () =>
				! domainOnlySite &&
				! isMigrationInProgress && (
					<AsyncLoad
						require="./publish"
						placeholder={ null }
						isActive={ this.isActive( 'post' ) }
						className="masterbar__item-new"
						tooltip={ translate( 'Create a New Post' ) }
					>
						{ translate( 'Write' ) }
					</AsyncLoad>
				),
			cart: () => (
				<AsyncLoad
					require="./masterbar-cart/masterbar-cart-wrapper"
					placeholder={ null }
					goToCheckout={ this.goToCheckout }
					onRemoveProduct={ this.onRemoveCartProduct }
					onRemoveCoupon={ this.onRemoveCartProduct }
					selectedSiteSlug={ currentSelectedSiteSlug }
					selectedSiteId={ currentSelectedSiteId }
				/>
			),
			me: () => (
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
						user={ this.props.user }
						alt={ translate( 'My Profile' ) }
						size={ 18 }
					/>
					<span className="masterbar__item-me-label">
						{ isMobile
							? user?.display_name
							: translate( 'My Profile', {
									context: 'Toolbar, must be shorter than ~12 chars',
							  } ) }
					</span>
				</Item>
			),
			notifications: () => (
				<Notifications
					isShowing={ this.props.isNotificationsShowing }
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
			),
			menu: () => (
				<>
					<Item
						tipTarget="Menu"
						icon="menu"
						onClick={ () => this.handleToggleMenu() }
						isActive={ this.state.isMenuOpen }
						className="masterbar__item-menu"
						tooltip={ translate( 'Menu' ) }
						ref={ ( ref ) => ref !== menuBtnRef && this.setState( { menuBtnRef: ref } ) }
					/>
					<MasterBarMobileMenu open={ this.state.isMenuOpen }>
						{ this.masterbarItemsMap().publish() }
						{ this.masterbarItemsMap().reader() }
						{ this.masterbarItemsMap().me() }
					</MasterBarMobileMenu>
					{ menuBtnRef && (
						<Popover
							isVisible={ ! hasDismissedThePopover }
							context={ menuBtnRef }
							onClose={ dismissPopover }
							autoPosition
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
									<Button onClick={ dismissPopover }>
										{ translate( 'Got it', { comment: 'Got it, as in OK' } ) }
									</Button>
								</div>
							</div>
						</Popover>
					) }
				</>
			),
		};
	}

	render() {
		const { isCheckout, isCheckoutPending } = this.props;
		const { isMobile } = this.state;

		const allItems = this.masterbarItemsMap();

		if ( isCheckout || isCheckoutPending ) {
			return allItems.checkout();
		}

		if ( isMobile ) {
			return (
				<>
					{ allItems.popupSearch() }
					<Masterbar>
						<div className="masterbar__section masterbar__section--left">
							{ this.renderMySites() }
							{ allItems.languageSwitcher() }
							{ allItems.search() }
						</div>
						<div className="masterbar__section masterbar__section--right">
							{ allItems.cart() }
							{ allItems.notifications() }
							{ allItems.menu() }
						</div>
					</Masterbar>
				</>
			);
		}
		return (
			<>
				{ allItems.popupSearch() }
				<Masterbar>
					<div className="masterbar__section masterbar__section--left">
						{ this.renderMySites() }
						{ allItems.reader() }
						{ allItems.languageSwitcher() }
						{ allItems.search() }
					</div>
					<div className="masterbar__section masterbar__section--center">
						{ allItems.planUpsell() }
						{ allItems.publish() }
					</div>
					<div className="masterbar__section masterbar__section--right">
						{ allItems.cart() }
						{ allItems.me() }
						{ allItems.notifications() }
					</div>
				</Masterbar>
			</>
		);
	}
}

export default connect(
	( state ) => {
		// Falls back to using the user's primary site if no site has been selected
		// by the user yet
		const currentSelectedSiteId = getSelectedSiteId( state );
		const siteId = currentSelectedSiteId || getPrimarySiteId( state );
		const isMigrationInProgress =
			isSiteMigrationInProgress( state, currentSelectedSiteId ) ||
			isSiteMigrationActiveRoute( state );

		return {
			isCustomerHomeEnabled: canCurrentUserUseCustomerHome( state, siteId ),
			isNotificationsShowing: isNotificationsOpen( state ),
			siteSlug: getSiteSlug( state, siteId ),
			domainOnlySite: isDomainOnlySite( state, siteId ),
			hasMoreThanOneSite: getCurrentUserSiteCount( state ) > 1,
			user: getCurrentUser( state ),
			isSupportSession: isSupportSession( state ),
			isMigrationInProgress,
			migrationStatus: getSiteMigrationStatus( state, currentSelectedSiteId ),
			currentSelectedSiteId,
			currentSelectedSiteSlug: currentSelectedSiteId
				? getSiteSlug( state, currentSelectedSiteId )
				: undefined,
			previousPath: getPreviousRoute( state ),
			isJetpackNotAtomic: isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ),
			currentLayoutFocus: getCurrentLayoutFocus( state ),
			hasDismissedThePopover: getPreference( state, MENU_POPOVER_PREFERENCE_KEY ),
		};
	},
	( dispatch ) => {
		return {
			setNextLayoutFocus,
			recordTracksEvent,
			updateSiteMigrationMeta,
			activateNextLayoutFocus,
			dismissPopover: () => {
				dispatch( savePreference( MENU_POPOVER_PREFERENCE_KEY, true ) );
			},
		};
	}
)( localize( MasterbarLoggedIn ) );
