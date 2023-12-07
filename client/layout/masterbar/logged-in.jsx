import config from '@automattic/calypso-config';
import { isEcommercePlan } from '@automattic/calypso-products/src';
import page from '@automattic/calypso-router';
import { Button, Popover } from '@automattic/components';
import { isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import { localize } from 'i18n-calypso';
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
import {
	getCurrentUser,
	getCurrentUserDate,
	getCurrentUserSiteCount,
} from 'calypso/state/current-user/selectors';
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
import { getSiteSlug, isJetpackSite, getSitePlanSlug } from 'calypso/state/sites/selectors';
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
		hasMoreThanOneSite: PropTypes.bool,
		isCheckout: PropTypes.bool,
		isCheckoutPending: PropTypes.bool,
		isInEditor: PropTypes.bool,
		hasDismissedThePopover: PropTypes.bool,
		isUserNewerThanNewNavigation: PropTypes.bool,
		loadHelpCenterIcon: PropTypes.bool,
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

	// will render as back button on mobile and in editor
	renderMySites() {
		const {
			domainOnlySite,
			hasNoSites,
			hasMoreThanOneSite,
			siteSlug,
			translate,
			isCustomerHomeEnabled,
			section,
			currentRoute,
			isSiteTrialExpired,
		} = this.props;
		const { isMenuOpen, isResponsiveMenu } = this.state;

		const homeUrl =
			// eslint-disable-next-line no-nested-ternary
			hasNoSites || isSiteTrialExpired
				? '/sites'
				: isCustomerHomeEnabled
				? `/home/${ siteSlug }`
				: getStatsPathForTab( 'day', siteSlug );

		let mySitesUrl = domainOnlySite
			? domainManagementList( siteSlug, currentRoute, true )
			: homeUrl;

		const icon =
			this.state.isMobile && this.props.isInEditor ? 'chevron-left' : this.wordpressIcon();

		if ( 'sites' === section && isResponsiveMenu ) {
			mySitesUrl = '';
		}
		if ( ! siteSlug && section === 'sites-dashboard' ) {
			// we are the /sites page but there is no site. Disable the home link
			return <Item icon={ icon } disabled />;
		}

		return (
			<Item
				url={ mySitesUrl }
				tipTarget="my-sites"
				icon={ icon }
				onClick={ this.clickMySites }
				isActive={ this.isActive( 'sites' ) && ! isMenuOpen }
				tooltip={ translate( 'Manage your sites' ) }
				preloadSection={ this.preloadMySites }
			>
				{ hasNoSites || hasMoreThanOneSite
					? translate( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
					: translate( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
			</Item>
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
				loadHelpCenterIcon={ loadHelpCenterIcon }
			/>
		);
	}

	renderReader( showLabel = true ) {
		const { translate } = this.props;
		const readerIcon = (
			<svg
				width="213"
				height="74"
				viewBox="0 0 213 74"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M212.09 37.7C209.42 32.73 206.14 30.63 204.55 29.78C203.02 28.96 201.32 28.4 200.4 28.1C199.75 27.88 197.12 27 193.42 26.55C191.56 26.32 189.54 26.22 187.32 26.25C182.82 11.11 168.77 0.01 152.19 0.01C135.61 0.01 122.89 10.12 117.76 24.19C114.49 22.02 110.57 20.75 106.37 20.75C102.17 20.75 98.2599 22.02 94.9799 24.19C89.8599 10.11 76.3699 0 60.5499 0C44.7299 0 29.9299 11.1 25.4199 26.24C23.1399 26.2 21.0699 26.31 19.1699 26.54C15.4699 26.99 12.8399 27.87 12.1899 28.09C11.2599 28.4 9.56991 28.96 8.03991 29.77C6.43991 30.62 3.16991 32.72 0.499912 37.69C0.159912 38.63 -0.320088 40.38 0.319912 42.2C1.57991 45.75 6.51991 47.86 9.94991 46.72C13.3499 45.59 15.5799 42.67 18.2899 39.45C19.7099 37.87 21.4199 36.08 23.7799 34.55C23.7599 34.85 23.7399 35.15 23.7199 35.45C23.7199 35.59 23.7199 35.73 23.6999 35.87C23.6999 35.89 23.6999 35.91 23.7199 35.93C23.7999 36.16 23.8299 36.39 23.8299 36.62H23.9199C23.9199 56.79 40.3799 73.25 60.5699 73.25C80.7599 73.25 97.2199 56.8 97.2199 36.62C97.2199 35.91 97.1099 35.24 97.0799 34.54C97.2699 34.37 97.4299 34.17 97.5799 33.97C99.6799 31.45 102.82 29.89 106.39 29.89C110.17 29.89 113.46 31.69 115.56 34.46C115.6 34.52 115.65 34.57 115.7 34.61C115.66 35.28 115.56 35.93 115.56 36.61C115.56 56.78 132.02 73.24 152.21 73.24C172.4 73.24 188.86 56.79 188.86 36.61L188.88 36.59C188.94 36.09 188.84 35.61 188.82 35.11C188.82 35.05 188.82 35 188.82 34.94C188.81 34.81 188.82 34.68 188.82 34.55C191.18 36.08 192.89 37.87 194.31 39.45C197.02 42.67 199.25 45.59 202.65 46.72C206.08 47.86 211.02 45.75 212.28 42.2C212.92 40.39 212.45 38.63 212.1 37.69L212.09 37.7ZM60.5699 64.1C45.3399 64.1 33.0799 51.86 33.0799 36.63C33.0799 21.4 45.3299 9.16 60.5699 9.16C75.8099 9.16 88.0599 21.4 88.0599 36.63C88.0599 51.86 75.8099 64.1 60.5699 64.1ZM152.19 64.1C136.96 64.1 124.7 51.86 124.7 36.63C124.7 21.4 136.95 9.16 152.19 9.16C167.43 9.16 179.68 21.4 179.68 36.63C179.68 51.86 167.43 64.1 152.19 64.1Z"
					fill="black"
				/>
			</svg>
		);

		return (
			<Item
				tipTarget="reader"
				className="masterbar__reader"
				url="/read"
				icon={ readerIcon }
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

	render() {
		const { isInEditor, isCheckout, isCheckoutPending, loadHelpCenterIcon } = this.props;
		const { isMobile } = this.state;

		if ( isCheckout || isCheckoutPending ) {
			return this.renderCheckout();
		}

		if ( isMobile ) {
			if ( isInEditor && loadHelpCenterIcon ) {
				return (
					<Masterbar>
						<div className="masterbar__section masterbar__section--left">
							{ this.renderMySites() }
						</div>
						<div className="masterbar__section masterbar__section--right">
							{ this.renderHelpCenter() }
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
		// Falls back to using the user's primary site if no site has been selected
		// by the user yet
		const currentSelectedSiteId = getSelectedSiteId( state );
		const siteId = currentSelectedSiteId || getPrimarySiteId( state );
		const sitePlanSlug = getSitePlanSlug( state, siteId );
		const isMigrationInProgress =
			isSiteMigrationInProgress( state, currentSelectedSiteId ) ||
			isSiteMigrationActiveRoute( state );

		const siteCount = getCurrentUserSiteCount( state ) ?? 0;

		return {
			isCustomerHomeEnabled: canCurrentUserUseCustomerHome( state, siteId ),
			isNotificationsShowing: isNotificationsOpen( state ),
			isEcommerce: isEcommercePlan( sitePlanSlug ),
			siteSlug: getSiteSlug( state, siteId ),
			sectionGroup,
			domainOnlySite: isDomainOnlySite( state, siteId ),
			hasNoSites: siteCount === 0,
			hasMoreThanOneSite: siteCount > 1,
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
		};
	},
	{
		setNextLayoutFocus,
		recordTracksEvent,
		updateSiteMigrationMeta,
		activateNextLayoutFocus,
		savePreference,
	}
)( localize( MasterbarLoggedIn ) );
