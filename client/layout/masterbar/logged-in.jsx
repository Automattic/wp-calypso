import config from '@automattic/calypso-config';
import { isEcommercePlan } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { CoreBadge } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { parse } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import AsyncLoad from 'calypso/components/async-load';
import Gravatar from 'calypso/components/gravatar';
import wpcom from 'calypso/lib/wp';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { preload } from 'calypso/sections-helper';
import { siteUsesWpAdminInterface } from 'calypso/sites-dashboard/utils';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { getAdminMenu } from 'calypso/state/admin-menu/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser, getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getSiteMigrationStatus from 'calypso/state/selectors/get-site-migration-status';
import hasGravatarDomainQueryParam from 'calypso/state/selectors/has-gravatar-domain-query-param';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteMigrationActiveRoute from 'calypso/state/selectors/is-site-migration-active-route';
import isSiteMigrationInProgress from 'calypso/state/selectors/is-site-migration-in-progress';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import getIsUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { updateSiteMigrationMeta } from 'calypso/state/sites/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import {
	getSiteSlug,
	isJetpackSite,
	getSitePlanSlug,
	getSitePlanName,
	getSiteTitle,
	getSiteUrl,
	getSiteAdminUrl,
	getSiteHomeUrl,
	getSite,
} from 'calypso/state/sites/selectors';
import canCurrentUserManageSiteOptions from 'calypso/state/sites/selectors/can-current-user-manage-site-options';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import isSimpleSite from 'calypso/state/sites/selectors/is-simple-site';
import { isSupportSession } from 'calypso/state/support/selectors';
import { activateNextLayoutFocus, setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { getMostRecentlySelectedSiteId, getSectionGroup } from 'calypso/state/ui/selectors';
import Item from './item';
import Masterbar from './masterbar';
import Notifications from './masterbar-notifications/notifications-button';

class MasterbarLoggedIn extends Component {
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
		loadHelpCenterIcon: PropTypes.bool,
		isGlobalSidebarVisible: PropTypes.bool,
		isGravatarDomain: PropTypes.bool,
	};

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
	}

	handleToggleMobileMenu = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_menu_clicked' );
		this.handleLayoutFocus( this.props.section );
		this.props.activateNextLayoutFocus();
	};

	clickMySites = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_my_sites_clicked' );

		/**
		 * Site Migration: Reset a failed migration when clicking on My Sites
		 *
		 * If the site migration has failed, clicking on My Sites sends the customer in a loop
		 * until they click the Try Again button on the migration screen.
		 *
		 * This code makes it possible to reset the failed migration state when clicking My Sites too.
		 */
		const { migrationStatus, siteId } = this.props;

		if ( siteId && migrationStatus === 'error' ) {
			/**
			 * Reset the in-memory site lock for the currently selected site
			 */
			this.props.updateSiteMigrationMeta( siteId, 'inactive', null, null );

			/**
			 * Reset the migration on the backend
			 */
			wpcom.req
				.post( {
					path: `/sites/${ siteId }/reset-migration`,
					apiNamespace: 'wpcom/v2',
				} )
				.catch( () => {} );
		}
	};

	clickReader = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_reader_clicked' );
	};

	clickMe = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_me_clicked' );
		window.scrollTo( 0, 0 );
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

	isActive = ( section, ignoreNotifications = false ) => {
		if ( ignoreNotifications ) {
			return section === this.props.section;
		}
		return section === this.props.section && ! this.props.isNotificationsShowing;
	};

	isMySitesActive = () => {
		const { isGlobalSidebarVisible, section } = this.props;
		return isGlobalSidebarVisible && ( 'sites' === section || 'sites-dashboard' === section );
	};

	isSidebarOpen = () => {
		return 'sidebar' === this.props.currentLayoutFocus;
	};

	wordpressIcon = () => {
		// WP icon replacement for "horizon" environment
		if ( config( 'hostname' ) === 'horizon.wordpress.com' ) {
			return 'my-sites-horizon';
		}

		return (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24" width="24">
				<g xmlns="http://www.w3.org/2000/svg">
					<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM3.5 12c0-1.232.264-2.402.736-3.459L8.291 19.65A8.5 8.5 0 013.5 12zm8.5 8.501c-.834 0-1.64-.122-2.401-.346l2.551-7.411 2.613 7.158a.718.718 0 00.061.117 8.497 8.497 0 01-2.824.482zm1.172-12.486c.512-.027.973-.081.973-.081.458-.054.404-.727-.054-.701 0 0-1.377.108-2.266.108-.835 0-2.239-.108-2.239-.108-.459-.026-.512.674-.054.701 0 0 .434.054.892.081l1.324 3.629-1.86 5.579-3.096-9.208c.512-.027.973-.081.973-.081.458-.054.403-.727-.055-.701 0 0-1.376.108-2.265.108-.16 0-.347-.004-.547-.01A8.491 8.491 0 0112 3.5c2.213 0 4.228.846 5.74 2.232-.037-.002-.072-.007-.11-.007-.835 0-1.427.727-1.427 1.509 0 .701.404 1.293.835 1.994.323.566.701 1.293.701 2.344 0 .727-.28 1.572-.647 2.748l-.848 2.833-3.072-9.138zm3.101 11.332l2.596-7.506c.485-1.213.646-2.182.646-3.045 0-.313-.021-.603-.057-.874A8.455 8.455 0 0120.5 12a8.493 8.493 0 01-4.227 7.347z" />
				</g>
			</svg>
		);
	};

	/**
	 * Hamburger menu used by the global nav.
	 * In nav unification, the menu is openned with the Sites button
	 */
	renderSidebarMobileMenu() {
		const { translate } = this.props;

		return (
			<Item
				tipTarget="mobile-menu"
				icon={ <span className="dashicons-before dashicons-menu-alt" /> }
				onClick={ this.handleToggleMobileMenu }
				isActive={ this.isSidebarOpen() }
				className="masterbar__item-sidebar-menu"
				tooltip={ translate( 'Menu' ) }
			/>
		);
	}

	// will render as back button on mobile and in editor
	renderMySites() {
		const {
			domainOnlySite,
			siteSlug,
			translate,
			section,
			currentRoute,
			isGlobalSidebarVisible,
			siteAdminUrl,
		} = this.props;

		const mySitesUrl = domainOnlySite
			? domainManagementList( siteSlug, currentRoute, true )
			: '/sites';
		const icon = this.wordpressIcon();

		if ( ! siteSlug && section === 'sites-dashboard' ) {
			// we are the /sites page but there is no site. Disable the home link
			return <Item icon={ icon } className="masterbar__item-no-sites" disabled />;
		}

		const subItems = isGlobalSidebarVisible
			? null
			: [
					[
						{
							label: translate( 'Sites' ),
							url: '/sites',
						},
						{
							label: translate( 'Domains' ),
							url: '/domains/manage',
						},
					],
					...( this.props.isSimpleSite
						? []
						: [
								[
									{
										label: translate( 'About WordPress' ),
										url: `${ siteAdminUrl }about.php`,
									},
									{
										label: translate( 'Get Involved' ),
										url: `${ siteAdminUrl }contribute.php`,
									},
								],
						  ] ),
			  ];

		return (
			<Item
				className="masterbar__item-my-sites"
				url={ mySitesUrl }
				tipTarget="my-sites"
				icon={ icon }
				subItems={ subItems }
				onClick={ this.clickMySites }
				isActive={ this.isMySitesActive() }
				tooltip={ translate( 'Manage your sites' ) }
				preloadSection={ this.preloadMySites }
				hasGlobalBorderStyle
			/>
		);
	}

	renderCheckout() {
		const {
			isCheckoutPending,
			isCheckoutFailed,
			previousPath,
			currentSelectedSiteSlug,
			isJetpackNotAtomic,
			title,
			loadHelpCenterIcon,
			isGravatarDomain,
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
				isGravatarDomain={ isGravatarDomain }
			/>
		);
	}

	renderUpdatesMenu() {
		const { adminMenu } = this.props;
		if ( ! adminMenu ) {
			return null;
		}

		let updatesCount = 0;
		let updatesUrl = '';
		for ( const menu of adminMenu ) {
			for ( const menuItem of menu.children || [] ) {
				if ( menuItem.slug === 'update-core-php' ) {
					updatesCount = menuItem.count;
					updatesUrl = menuItem.url;
					break;
				}
			}
		}

		if ( updatesCount ) {
			return (
				<Item
					className="masterbar__item-updates"
					url={ updatesUrl }
					icon={ <span className="dashicons-before dashicons-update" /> }
				>
					{ updatesCount }
				</Item>
			);
		}
		return null;
	}

	renderCommentsMenu() {
		const { adminMenu } = this.props;
		if ( ! adminMenu ) {
			return null;
		}

		let commentsCount = 0;
		let commentsUrl = '';
		for ( const menu of adminMenu ) {
			if ( menu.icon === 'dashicons-admin-comments' ) {
				commentsCount = menu.count || 0;
				commentsUrl = menu.url;
				break;
			}
		}

		return (
			<Item
				className="masterbar__item-comments"
				url={ commentsUrl }
				icon={ <span className="dashicons-before dashicons-admin-comments" /> }
			>
				<span className={ commentsCount === 0 ? 'count-0' : '' }>{ commentsCount }</span>
			</Item>
		);
	}

	renderSiteBadges() {
		const {
			site,
			translate,
			isUnlaunchedSite,
			isTrial,
			isSiteP2,
			isP2Hub,
			isAtomicAndEditingToolkitDeactivated,
		} = this.props;

		if ( ! site ) {
			return null;
		}

		// Status badges
		const badges = [];

		// We show public coming soon badge only when the site is not private.
		const shouldShowPublicComingSoonSiteBadge =
			! site.is_private &&
			site.is_coming_soon &&
			! isAtomicAndEditingToolkitDeactivated &&
			! isTrial;

		// Cover the coming Soon v1 cases for sites still unlaunched and/or in Coming Soon private by default.
		// isPrivateAndUnlaunched means it is an unlaunched coming soon v1 site
		const isPrivateAndUnlaunched = site.is_private && isUnlaunchedSite;
		const shouldShowPrivateByDefaultComingSoonBadge = site.is_coming_soon || isPrivateAndUnlaunched;

		// P2 Badge
		if ( isSiteP2 && ! isP2Hub ) {
			badges.push( 'P2' );
		}

		// Staging Badge
		if ( site?.is_wpcom_staging_site ) {
			badges.push( translate( 'Staging' ) );
		}

		// Trial Badge
		if ( isTrial ) {
			badges.push( translate( 'Trial' ) );
		}

		// P2 Workspace Badge
		if ( isP2Hub ) {
			badges.push( 'P2 Workspace' );
		}

		// Private/Coming Soon Badge
		if ( site.is_private ) {
			badges.push(
				shouldShowPrivateByDefaultComingSoonBadge
					? translate( 'Coming Soon' )
					: translate( 'Private' )
			);
		}

		// Express Service Badge
		if ( site.options && site.options.is_difm_lite_in_progress ) {
			badges.push( translate( 'Express Service' ) );
		}

		// Public Coming Soon Badge
		if ( shouldShowPublicComingSoonSiteBadge ) {
			badges.push( translate( 'Coming Soon' ) );
		}

		// Redirect Badge
		if ( site.options && site.options.is_redirect ) {
			badges.push( translate( 'Redirect' ) );
		}

		// Domain Badge
		if ( site.options && site.options.is_domain_only ) {
			badges.push( translate( 'Domain' ) );
		}

		return badges.length > 0
			? badges.map( ( badge ) => (
					<CoreBadge className="masterbar__info-badge" key={ badge }>
						{ badge }
					</CoreBadge>
			  ) )
			: null;
	}

	renderSiteMenu() {
		const {
			siteSlug,
			translate,
			siteTitle,
			siteUrl,
			isClassicView,
			siteAdminUrl,
			siteHomeUrl,
			domainOnlySite,
			sitePlanName,
			site,
		} = this.props;

		// Only display when a site is selected and is not domain-only site.
		if ( ! siteSlug || domainOnlySite ) {
			return null;
		}

		const siteHomeOrAdminItem = isClassicView
			? {
					label: translate( 'Dashboard' ),
					url: siteAdminUrl,
			  }
			: {
					label: translate( 'My Home' ),
					url: siteHomeUrl,
			  };

		// Get site badges
		const siteBadges = this.renderSiteBadges();

		// Create a site status item for the dropdown if we have badges
		const menuItems = [
			[ { label: translate( 'Visit Site' ), url: siteUrl }, siteHomeOrAdminItem ],
			[
				{
					label: (
						<div className="masterbar__site-infos">
							{ siteBadges && siteBadges.length > 0 && (
								<div className="masterbar__site-info">
									<span className="masterbar__site-info-label">{ translate( 'Status' ) }</span>
									<div className="masterbar__info-badges">{ siteBadges }</div>
								</div>
							) }
							{ ! site?.is_wpcom_staging_site && (
								<div className="masterbar__site-info">
									<span className="masterbar__site-info-label">{ translate( 'Plan' ) }</span>
									<div className="masterbar__info-badges">
										<CoreBadge className="masterbar__info-badge">{ sitePlanName }</CoreBadge>
									</div>
								</div>
							) }
						</div>
					),
				},
			],
		];

		return (
			<Item
				className="masterbar__item-my-site"
				url={ siteUrl }
				icon={ <span className="dashicons-before dashicons-admin-home" /> }
				tipTarget="visit-site"
				subItems={ menuItems }
			>
				{ siteTitle.length > 40 ? `${ siteTitle.substring( 0, 40 ) }\u2026` : siteTitle }
			</Item>
		);
	}

	renderSiteActionMenu() {
		const {
			siteSlug,
			isClassicView,
			translate,
			siteAdminUrl,
			newPostUrl,
			newPageUrl,
			domainOnlySite,
			isMigrationInProgress,
			isEcommerce,
			hasNoSites,
		} = this.props;

		// Only display on site-specific pages.
		// domainOnlySite's still get currentSelectedSiteSlug, removing this check would require changing checks below.
		if ( domainOnlySite || isMigrationInProgress || isEcommerce || hasNoSites ) {
			return null;
		}

		let siteActions = [];

		if ( siteSlug ) {
			siteActions = [
				{
					label: translate( 'Post' ),
					url: newPostUrl,
				},
				{
					label: translate( 'Media' ),
					url: isClassicView ? `${ siteAdminUrl }media-new.php` : `/media/${ siteSlug }`,
				},
				{
					label: translate( 'Page' ),
					url: newPageUrl,
				},
				{
					label: translate( 'User' ),
					url: isClassicView ? `${ siteAdminUrl }user-new.php` : `/people/new/${ siteSlug }`,
				},
			];
		} else {
			siteActions = [
				{
					label: translate( 'Post' ),
					url: '/post',
				},
				{
					label: translate( 'Media' ),
					url: '/media',
				},
				{
					label: translate( 'Page' ),
					url: '/page',
				},
				{
					label: translate( 'User' ),
					url: '/people/new',
				},
			];
		}
		return (
			<Item
				className="masterbar__item-my-site-actions"
				url={ siteActions[ 0 ].url }
				subItems={ [ siteActions ] }
				icon={ <span className="dashicons-before dashicons-plus" /> }
				tooltip={ translate( 'New', { context: 'admin bar menu group label' } ) }
				tipTarget="new-menu"
			>
				{ translate( 'New', { context: 'admin bar menu group label' } ) }
			</Item>
		);
	}

	renderLaunchButton() {
		const { isA4ADevSite, isUnlaunchedSite, siteId, translate, isManageSiteOptionsEnabled } =
			this.props;

		if ( ! isUnlaunchedSite || ! isManageSiteOptionsEnabled || isA4ADevSite ) {
			return null;
		}

		return (
			<Item
				as={ Button }
				variant="primary"
				// Keep the Launch button always in blueberry (default scheme: modern) like in wp-admin.
				className={ clsx( 'masterbar__item-launch-site', 'color-scheme', 'is-global' ) }
				icon={
					<svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M10.6242 9.74354L7.62419 12.1261V13.2995C7.62419 13.4418 7.77653 13.5322 7.90147 13.4641L10.5265 12.0322C10.5867 11.9994 10.6242 11.9363 10.6242 11.8676V9.74354ZM6.49919 12.0875L3.91203 9.50037H2.7001C1.70383 9.50037 1.07079 8.43399 1.54786 7.55937L2.97968 4.93437C3.20967 4.51272 3.65161 4.25036 4.13191 4.25036H7.17569C9.1325 2.16798 11.3176 0.754637 14.1427 0.531305C14.9004 0.471402 15.5282 1.09911 15.4682 1.85687C15.2449 4.68199 13.8316 6.86706 11.7492 8.82386V11.8676C11.7492 12.3479 11.4868 12.7899 11.0652 13.0199L8.44018 14.4517C7.56557 14.9288 6.49919 14.2957 6.49919 13.2995V12.0875ZM6.25602 5.37536H4.13191C4.0633 5.37536 4.00017 5.41284 3.96731 5.47308L2.53549 8.09808C2.46734 8.22303 2.55777 8.37536 2.7001 8.37536H3.87344L6.25602 5.37536Z"
						/>
						<path d="M0.498047 13.3962C0.498047 12.2341 1.44011 11.2921 2.60221 11.2921C3.76431 11.2921 4.70638 12.2341 4.70638 13.3962C4.70638 14.5583 3.76431 15.5004 2.60221 15.5004H1.06055C0.749887 15.5004 0.498047 15.2486 0.498047 14.9379V13.3962Z" />
					</svg>
				}
				onClick={ () => {
					this.props.recordTracksEvent( 'calypso_masterbar_launch_site' );
					this.props.launchSiteOrRedirectToLaunchSignupFlow( siteId );
				} }
			>
				{ translate( 'Launch site' ) }
			</Item>
		);
	}

	renderProfileMenu() {
		const { translate, user, isGlobalSidebarVisible, siteAdminUrl } = this.props;
		const profileActions = [
			{
				label: (
					<div className="masterbar__item-howdy-account-wrapper">
						<Gravatar
							className="masterbar__item-howdy-account-gravatar"
							alt=" "
							user={ user }
							size={ 64 }
						/>
						<div className="masterbar__item-howdy-account-details">
							<span className="display-name">{ user.display_name }</span>
							<span className="username">{ user.username }</span>
							<span className="display-name edit-profile">
								{ isGlobalSidebarVisible ? translate( 'My Profile' ) : translate( 'Edit Profile' ) }
							</span>
						</div>
					</div>
				),
				url: isGlobalSidebarVisible ? '/me' : `${ siteAdminUrl }profile.php`,
			},
			{
				label: translate( 'Log Out' ),
				onClick: () => this.props.redirectToLogout(),
				tooltip: translate( 'Log out of WordPress.com' ),
				className: 'logout-link',
			},
		];

		const wpcomActions = [
			{
				label: (
					<span className="button wpcom-button">
						{ translate( 'My {{wpcomIcon/}} WordPress.com Account', {
							components: {
								wpcomIcon: this.wordpressIcon(),
							},
						} ) }
					</span>
				),
				url: '/me/account',
				className: 'wpcom-link',
			},
		];

		return (
			<Item
				tipTarget="me"
				url="/me"
				onClick={ this.clickMe }
				isActive={ this.isActive( 'me', true ) }
				className="masterbar__item-howdy"
				tooltip={ translate( 'Update your profile, personal settings, and more' ) }
				preloadSection={ this.preloadMe }
				subItems={ [ profileActions, wpcomActions ] }
				hasGlobalBorderStyle
			>
				<span className="masterbar__item-howdy-howdy">
					{ translate( 'Howdy, %(display_name)s', {
						args: { display_name: user.display_name },
					} ) }
				</span>
				<Gravatar
					className="masterbar__item-howdy-gravatar"
					role="presentation"
					user={ user }
					size={ 16 }
				/>
			</Item>
		);
	}

	renderReader() {
		const { translate } = this.props;
		return (
			<Item
				tipTarget="reader"
				className="masterbar__reader"
				url="/reader"
				icon={ <ReaderIcon className="masterbar__menu-icon masterbar_svg-reader" /> }
				onClick={ this.clickReader }
				isActive={ this.isActive( 'reader', true ) }
				tooltip={ translate( 'Read the blogs and topics you follow' ) }
				preloadSection={ this.preloadReader }
				hasGlobalBorderStyle
			>
				<span className="masterbar__icon-label masterbar__item-reader-label">
					{ translate( 'Reader' ) }
				</span>
			</Item>
		);
	}

	renderLanguageSwitcher() {
		if ( this.props.isSupportSession || config.isEnabled( 'quick-language-switcher' ) ) {
			return <AsyncLoad require="./quick-language-switcher" placeholder={ null } />;
		}
		return null;
	}

	renderCart() {
		const { siteSlug, siteId, sectionGroup } = this.props;
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
				selectedSiteSlug={ siteSlug }
				selectedSiteId={ siteId }
			/>
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

	renderHelpCenter() {
		const { siteId, translate } = this.props;

		return (
			<AsyncLoad
				require="./masterbar-help-center"
				siteId={ siteId }
				tooltip={ translate( 'Help' ) }
				placeholder={ null }
			/>
		);
	}

	render() {
		const { isCheckout, isCheckoutPending, isCheckoutFailed, loadHelpCenterIcon } = this.props;

		// Checkout flow uses it's own version of the masterbar
		if ( isCheckout || isCheckoutPending || isCheckoutFailed ) {
			return this.renderCheckout();
		}

		return (
			<Masterbar>
				<div className="masterbar__section masterbar__section--left">
					{ this.renderSidebarMobileMenu() }
					{ this.renderMySites() }
					{ this.renderSiteMenu() }
					{ this.renderUpdatesMenu() }
					{ this.renderCommentsMenu() }
					{ this.renderSiteActionMenu() }
					{ this.renderLanguageSwitcher() }
					{ this.renderLaunchButton() }
				</div>
				<div className="masterbar__section masterbar__section--right">
					{ this.renderCart() }
					{ this.renderReader() }
					{ loadHelpCenterIcon && this.renderHelpCenter() }
					{ this.renderNotifications() }
					{ this.renderProfileMenu() }
				</div>
			</Masterbar>
		);
	}
}

export default connect(
	( state ) => {
		const sectionGroup = getSectionGroup( state );

		// Falls back to using the user's primary site if no site has been selected
		// by the user yet
		const siteId = getMostRecentlySelectedSiteId( state ) || getPrimarySiteId( state );
		const sitePlanSlug = getSitePlanSlug( state, siteId );
		const isMigrationInProgress =
			isSiteMigrationInProgress( state, siteId ) || isSiteMigrationActiveRoute( state );

		const siteCount = getCurrentUserSiteCount( state ) ?? 0;
		const site = getSite( state, siteId );
		const isClassicView = site && siteUsesWpAdminInterface( site );

		return {
			isManageSiteOptionsEnabled: canCurrentUserManageSiteOptions( state, siteId ),
			isNotificationsShowing: isNotificationsOpen( state ),
			isEcommerce: isEcommercePlan( sitePlanSlug ),
			isA4ADevSite: site?.is_a4a_dev_site,
			siteId: siteId,
			site: site,
			siteSlug: getSiteSlug( state, siteId ),
			sitePlanName: getSitePlanName( state, siteId ),
			siteTitle: getSiteTitle( state, siteId ),
			siteUrl: getSiteUrl( state, siteId ),
			siteAdminUrl: getSiteAdminUrl( state, siteId ),
			siteHomeUrl: getSiteHomeUrl( state, siteId ),
			adminMenu: getAdminMenu( state, siteId ),
			sectionGroup,
			domainOnlySite: isDomainOnlySite( state, siteId ),
			hasNoSites: siteCount === 0,
			user: getCurrentUser( state ),
			isSupportSession: isSupportSession( state ),
			isMigrationInProgress,
			migrationStatus: getSiteMigrationStatus( state, siteId ),
			isClassicView,
			currentSelectedSiteSlug: siteId ? getSiteSlug( state, siteId ) : undefined,
			previousPath: getPreviousRoute( state ),
			isSimpleSite: isSimpleSite( state, siteId ),
			isJetpackNotAtomic: isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ),
			currentLayoutFocus: getCurrentLayoutFocus( state ),
			currentRoute: getCurrentRoute( state ),
			newPostUrl: getEditorUrl( state, siteId, null, 'post' ),
			newPageUrl: getEditorUrl( state, siteId, null, 'page' ),
			isUnlaunchedSite: getIsUnlaunchedSite( state, siteId ),
			isTrial: isTrialSite( state, siteId ),
			isSiteP2: isSiteWPForTeams( state, siteId ),
			isP2Hub: isSiteP2Hub( state, siteId ),
			isAtomicAndEditingToolkitDeactivated:
				isAtomicSite( state, siteId ) &&
				getSiteOption( state, siteId, 'editing_toolkit_is_active' ) === false,
			isGravatarDomain: hasGravatarDomainQueryParam( state ),
		};
	},
	{
		setNextLayoutFocus,
		recordTracksEvent,
		updateSiteMigrationMeta,
		activateNextLayoutFocus,
		savePreference,
		requestAdminMenu,
		redirectToLogout,
		launchSiteOrRedirectToLaunchSignupFlow,
	}
)( localize( MasterbarLoggedIn ) );
