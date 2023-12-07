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
		readerIcon: 0,
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
		this.actionSearchShortCutListener = ( event ) => {
			if ( event.ctrlKey && event.shiftKey && event.key === 'F' ) {
				this.clickSearchActions();
			}
			if ( event.shiftKey && event.key === 'I' ) {
				this.setState( ( state ) => ( {
					readerIcon: state.readerIcon === 3 ? 0 : state.readerIcon + 1,
				} ) );
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
		const readerIcons = [
			/* First */
			<svg
				className="gridicon gridicons-reader"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M20.9571 12.0881C20.731 11.681 20.4533 11.5089 20.3187 11.4393C20.1891 11.3722 20.0452 11.3263 19.9673 11.3017C19.9122 11.2837 19.6896 11.2116 19.3763 11.1747C19.2188 11.1559 19.0478 11.1477 18.8598 11.1502C18.4788 9.91003 17.2892 9.00082 15.8854 9.00082C14.4816 9.00082 13.4046 9.82894 12.9702 10.9814C12.6933 10.8037 12.3614 10.6997 12.0058 10.6997C11.6502 10.6997 11.3192 10.8037 11.0414 10.9814C10.6079 9.82812 9.46574 9 8.12627 9C6.7868 9 5.53369 9.90922 5.15183 11.1494C4.95879 11.1461 4.78352 11.1551 4.62265 11.1739C4.30937 11.2108 4.08669 11.2829 4.03166 11.3009C3.95292 11.3263 3.80982 11.3722 3.68028 11.4385C3.54481 11.5081 3.26794 11.6801 3.04187 12.0872C3.01308 12.1642 2.97244 12.3076 3.02663 12.4567C3.13332 12.7474 3.55158 12.9203 3.842 12.8269C4.12987 12.7343 4.31869 12.4952 4.54814 12.2314C4.66837 12.102 4.81316 11.9554 5.01298 11.83C5.01128 11.8546 5.00959 11.8792 5.0079 11.9038C5.0079 11.9152 5.0079 11.9267 5.0062 11.9382C5.0062 11.9398 5.0062 11.9414 5.0079 11.9431C5.01467 11.9619 5.01721 11.9808 5.01721 11.9996H5.02483C5.02483 13.6517 6.41849 15 8.12796 15C9.83744 15 11.2311 13.6526 11.2311 11.9996C11.2311 11.9414 11.2218 11.8866 11.2192 11.8292C11.2353 11.8153 11.2489 11.7989 11.2616 11.7825C11.4394 11.5761 11.7052 11.4483 12.0075 11.4483C12.3276 11.4483 12.6061 11.5958 12.7839 11.8227C12.7873 11.8276 12.7916 11.8317 12.7958 11.8349C12.7924 11.8898 12.7839 11.9431 12.7839 11.9988C12.7839 13.6509 14.1776 14.9992 15.8871 14.9992C17.5965 14.9992 18.9902 13.6517 18.9902 11.9988L18.9919 11.9971C18.997 11.9562 18.9885 11.9169 18.9868 11.8759C18.9868 11.871 18.9868 11.8669 18.9868 11.862C18.986 11.8513 18.9868 11.8407 18.9868 11.83C19.1866 11.9554 19.3314 12.102 19.4516 12.2314C19.6811 12.4952 19.8699 12.7343 20.1578 12.8269C20.4482 12.9203 20.8665 12.7474 20.9732 12.4567C21.0273 12.3084 20.9876 12.1642 20.9579 12.0872L20.9571 12.0881ZM8.12796 14.2505C6.83845 14.2505 5.8004 13.2479 5.8004 12.0004C5.8004 10.7529 6.8376 9.75031 8.12796 9.75031C9.41832 9.75031 10.4555 10.7529 10.4555 12.0004C10.4555 13.2479 9.41832 14.2505 8.12796 14.2505ZM15.8854 14.2505C14.5959 14.2505 13.5578 13.2479 13.5578 12.0004C13.5578 10.7529 14.595 9.75031 15.8854 9.75031C17.1757 9.75031 18.2129 10.7529 18.2129 12.0004C18.2129 13.2479 17.1757 14.2505 15.8854 14.2505Z"
					fill="currentColor"
				/>
			</svg>,
			/* Second */
			<svg
				className="gridicon gridicons-reader"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M20.9762 10.3795C20.7838 9.92777 20.5166 9.71953 20.3852 9.63434C20.2589 9.55174 20.1172 9.48978 20.039 9.45622C19.9841 9.43213 19.7641 9.33576 19.4472 9.26778C19.2247 9.22045 18.9739 9.18947 18.6835 9.18173L17.0325 9.0561C16.9054 9.04319 16.7774 9.03201 16.6468 9.02426C15.2844 8.94596 13.7107 9.14731 12.003 9.23422V9.22906C10.2919 9.14129 8.71816 8.93994 7.35491 9.01738C7.17366 9.0277 6.9967 9.04405 6.82233 9.06557L5.31734 9.18001C5.027 9.18775 4.77617 9.21873 4.55368 9.26606C4.23671 9.33403 4.01595 9.43127 3.96183 9.4545C3.88366 9.48806 3.74192 9.55001 3.61565 9.63262C3.48422 9.71867 3.21707 9.9269 3.02465 10.3778C3.00231 10.4613 2.97483 10.6179 3.04441 10.7702C3.15608 11.0145 3.47563 11.1557 3.74622 11.129C4.50214 11.3441 4.40765 12.449 4.76242 13.2363C4.88956 13.6054 5.05535 13.9316 5.27182 14.1983C6.39712 15.5794 9.31431 14.9839 10.3546 13.7741C10.5925 13.4979 10.7849 13.1735 10.9344 12.8043C11.29 12.0643 11.2488 10.6626 11.9867 10.5602C12.7546 10.6308 12.7074 12.06 13.0673 12.8095C13.2176 13.1787 13.4101 13.5031 13.6471 13.7793C14.6865 14.99 17.6046 15.5854 18.729 14.2035C18.9464 13.9367 19.1113 13.6106 19.2384 13.2415C19.5941 12.4515 19.497 11.3415 20.2615 11.1316V11.1299C20.5304 11.1531 20.8448 11.0128 20.9556 10.7702C21.0252 10.6179 20.9977 10.4621 20.9754 10.3778L20.9762 10.3795ZM10.5307 11.3235C10.4774 12.0187 10.236 12.8276 9.71547 13.4273C9.09097 14.0391 8.26288 14.2869 7.24925 14.2956C5.80096 14.2826 5.45135 13.4161 5.17647 12.0738C5.02786 11.4826 5.01068 10.8106 5.2366 10.5077C5.42042 10.2608 5.6704 10.1205 5.947 10.0336C6.71925 9.79095 7.7492 9.74448 8.54893 9.78751C8.90542 9.80644 9.24129 9.85204 9.55999 9.9183C10.297 10.0723 10.5942 10.5172 10.5324 11.3217L10.5307 11.3235ZM18.8244 12.0807C18.5495 13.423 18.1999 14.2895 16.7516 14.3016C15.738 14.2921 14.9099 14.0443 14.2854 13.4334C13.764 12.8336 13.5235 12.0248 13.4702 11.3295C13.4083 10.5241 13.7056 10.0801 14.4426 9.92604C14.7613 9.85979 15.0972 9.81418 15.4536 9.79525C16.2534 9.75223 17.2833 9.79869 18.0556 10.0413C18.3322 10.1283 18.5822 10.2685 18.766 10.5155C18.991 10.8184 18.9747 11.4904 18.8261 12.0815L18.8244 12.0807Z"
					fill="currentColor"
				/>
			</svg>,
			/* Third */
			<svg
				className="gridicon gridicons-reader"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M20.9571 11.2157C20.731 10.7917 20.4533 10.6126 20.3187 10.5401C20.1891 10.4702 20.0452 10.4224 19.9673 10.3968C19.9122 10.3781 19.6896 10.303 19.3763 10.2646C19.2188 10.245 19.0478 10.2365 18.8598 10.239C18.4788 8.94764 17.2892 8.00085 15.8854 8.00085C14.4816 8.00085 13.4046 8.8632 12.9702 10.0633C12.6933 9.87822 12.3614 9.76989 12.0058 9.76989C11.6502 9.76989 11.3192 9.87822 11.0414 10.0633C10.6079 8.86234 9.46574 8 8.12627 8C6.7868 8 5.53369 8.94679 5.15183 10.2382C4.95879 10.2348 4.78352 10.2441 4.62265 10.2638C4.30937 10.3021 4.08669 10.3772 4.03166 10.396C3.95292 10.4224 3.80982 10.4702 3.68028 10.5393C3.54481 10.6118 3.26794 10.7909 3.04187 11.2148C3.01308 11.295 2.97244 11.4443 3.02663 11.5995C3.13332 11.9023 3.55158 12.0823 3.842 11.985C4.12987 11.8886 4.31869 11.6396 4.54814 11.3649C4.66837 11.2302 4.81316 11.0775 5.01298 10.947C5.01128 10.9726 5.00959 10.9982 5.0079 11.0237C5.0079 11.0357 5.0079 11.0476 5.0062 11.0596C5.0062 11.0613 5.0062 11.063 5.0079 11.0647C5.01467 11.0843 5.01721 11.1039 5.01721 11.1235H5.02483C5.02483 12.844 6.41849 14.2479 8.12796 14.2479C9.83744 14.2479 11.2311 12.8448 11.2311 11.1235C11.2311 11.063 11.2218 11.0058 11.2192 10.9461C11.2353 10.9316 11.2489 10.9146 11.2616 10.8975C11.4394 10.6826 11.7052 10.5495 12.0075 10.5495C12.3276 10.5495 12.6061 10.703 12.7839 10.9393C12.7873 10.9444 12.7916 10.9487 12.7958 10.9521C12.7924 11.0092 12.7839 11.0647 12.7839 11.1227C12.7839 12.8431 14.1776 14.2471 15.8871 14.2471C17.5965 14.2471 18.9902 12.844 18.9902 11.1227L18.9919 11.121C18.997 11.0783 18.9885 11.0374 18.9868 10.9947C18.9868 10.9896 18.9868 10.9854 18.9868 10.9802C18.986 10.9692 18.9868 10.9581 18.9868 10.947C19.1866 11.0775 19.3314 11.2302 19.4516 11.3649C19.6811 11.6396 19.8699 11.8886 20.1578 11.985C20.4482 12.0823 20.8665 11.9023 20.9732 11.5995C21.0273 11.4451 20.9876 11.295 20.9579 11.2148L20.9571 11.2157ZM8.12796 13.4675C6.83845 13.4675 5.8004 12.4235 5.8004 11.1244C5.8004 9.82534 6.8376 8.78131 8.12796 8.78131C9.41832 8.78131 10.4555 9.82534 10.4555 11.1244C10.4555 12.4235 9.41832 13.4675 8.12796 13.4675ZM15.8854 13.4675C14.5959 13.4675 13.5578 12.4235 13.5578 11.1244C13.5578 9.82534 14.595 8.78131 15.8854 8.78131C17.1757 8.78131 18.2129 9.82534 18.2129 11.1244C18.2129 12.4235 17.1757 13.4675 15.8854 13.4675Z"
					fill="currentColor"
				/>
				<path
					d="M15.7818 15.2339C15.747 15.1015 15.6349 15.0127 15.4838 14.9948C15.3964 14.9847 15.3098 14.9995 15.2206 15.0384C14.9523 15.1561 14.7061 15.2464 14.4675 15.3157C13.7764 15.5167 13.0675 15.6273 12.3611 15.6452C11.6556 15.6631 11.0808 15.6304 10.5502 15.5431C10.2471 15.4933 9.93379 15.4263 9.59164 15.3391C9.34627 15.2768 9.08817 15.1818 8.77998 15.0392C8.62206 14.9668 8.42169 14.9863 8.31472 15.0836C8.22812 15.1631 8.19076 15.2721 8.21284 15.3819C8.23491 15.4941 8.31811 15.5899 8.43528 15.6382C8.48792 15.66 8.54055 15.6826 8.59319 15.7044C8.7579 15.7745 8.92856 15.8461 9.10685 15.9053C9.47872 16.0284 9.89049 16.1273 10.3642 16.2075C10.8405 16.2885 11.3618 16.3298 11.9145 16.3306L12.0232 16.329C12.2414 16.3259 12.4307 16.3236 12.6235 16.3096C13.0259 16.28 13.3833 16.2371 13.7162 16.1795C14.3291 16.0736 14.9438 15.8929 15.5424 15.6413C15.5857 15.6234 15.6213 15.6031 15.6519 15.5805C15.7699 15.4917 15.8175 15.3656 15.7818 15.2332V15.2339Z"
					fill="currentColor"
				/>
			</svg>,
			/* Original */
			<svg
				className="gridicon gridicons-reader"
				height="24"
				viewBox="0 0 24 24"
				width="24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M3,4v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V4H3z M10,15H5v-1h5V15z M12,13H5v-1h7V13z M12,11H5v-1h7V11z M19,15h-5v-5h5
					V15z M19,8H5V6h14V8z"
					fill="currentColor"
				/>
			</svg>,
		];

		return (
			<Item
				tipTarget="reader"
				className="masterbar__reader"
				url="/read"
				icon={ readerIcons[ this.state.readerIcon ] }
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
