import config from '@automattic/calypso-config';
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
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getSiteMigrationStatus from 'calypso/state/selectors/get-site-migration-status';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';
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
import Notifications from './notifications';

class MasterbarLoggedIn extends Component {
	state = {
		isActionSearchVisible: false,
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

	handleLayoutFocus = ( currentSection ) => {
		if ( ! this.props.isNavUnificationEnabled ) {
			this.props.setNextLayoutFocus( 'sidebar' );
		} else if ( currentSection !== this.props.section ) {
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
	}

	componentWillUnmount() {
		document.removeEventListener( 'keydown', this.actionSearchShortCutListener );
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
		const homeUrl = isCustomerHomeEnabled
			? `/home/${ siteSlug }`
			: getStatsPathForTab( 'day', siteSlug );

		let mySitesUrl = domainOnlySite ? domainManagementList( siteSlug ) : homeUrl;
		if ( this.props.isNavUnificationEnabled && 'sites' === section ) {
			mySitesUrl = '';
		}
		return (
			<Item
				url={ mySitesUrl }
				tipTarget="my-sites"
				icon={ this.wordpressIcon() }
				onClick={ this.clickMySites }
				isActive={ this.isActive( 'sites' ) }
				tooltip={ translate( 'View a list of your sites and access their dashboards' ) }
				preloadSection={ this.preloadMySites }
			>
				{ hasMoreThanOneSite
					? translate( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
					: translate( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
			</Item>
		);
	}

	render() {
		const isWordPressActionSearchFeatureEnabled = config.isEnabled( 'wordpress-action-search' );
		const {
			domainOnlySite,
			translate,
			isCheckout,
			isCheckoutPending,
			isMigrationInProgress,
			previousPath,
			siteSlug,
			isJetpackNotAtomic,
			title,
			currentSelectedSiteSlug,
			currentSelectedSiteId,
		} = this.props;

		const { isActionSearchVisible } = this.state;

		if ( isCheckout || isCheckoutPending ) {
			return (
				<AsyncLoad
					require="calypso/layout/masterbar/checkout.tsx"
					placeholder={ null }
					title={ title }
					isJetpackNotAtomic={ isJetpackNotAtomic }
					previousPath={ previousPath }
					siteSlug={ siteSlug }
					isLeavingAllowed={ ! isCheckoutPending }
				/>
			);
		}

		return (
			<>
				{ isWordPressActionSearchFeatureEnabled && isActionSearchVisible ? (
					<AsyncLoad
						require="calypso/layout/popup-search"
						placeholder={ null }
						onClose={ this.onSearchActionsClose }
					/>
				) : null }
				<Masterbar>
					<div className="masterbar__section masterbar__section--left">
						{ this.renderMySites() }
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
						{ ( this.props.isSupportSession || config.isEnabled( 'quick-language-switcher' ) ) && (
							<AsyncLoad require="./quick-language-switcher" placeholder={ null } />
						) }
						{ isWordPressActionSearchFeatureEnabled && (
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
						) }
					</div>
					<div className="masterbar__section masterbar__section--center">
						{ ! domainOnlySite && ! isMigrationInProgress && (
							<AsyncLoad
								require="./publish"
								placeholder={ null }
								isActive={ this.isActive( 'post' ) }
								className="masterbar__item-new"
								tooltip={ translate( 'Create a New Post' ) }
							>
								{ translate( 'Write' ) }
							</AsyncLoad>
						) }
					</div>
					<div className="masterbar__section masterbar__section--right">
						<AsyncLoad
							require="./masterbar-cart/masterbar-cart-wrapper"
							placeholder={ null }
							goToCheckout={ this.goToCheckout }
							onRemoveProduct={ this.onRemoveCartProduct }
							onRemoveCoupon={ this.onRemoveCartProduct }
							selectedSiteSlug={ currentSelectedSiteSlug }
							selectedSiteId={ currentSelectedSiteId }
						/>
						<Item
							tipTarget="me"
							url="/me"
							icon="user-circle"
							onClick={ this.clickMe }
							isActive={ this.isActive( 'me' ) }
							className="masterbar__item-me"
							tooltip={ translate( 'Update your profile, personal settings, and more' ) }
							preloadSection={ this.preloadMe }
						>
							<Gravatar user={ this.props.user } alt={ translate( 'My Profile' ) } size={ 18 } />
							<span className="masterbar__item-me-label">
								{ translate( 'My Profile', {
									context: 'Toolbar, must be shorter than ~12 chars',
								} ) }
							</span>
						</Item>
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
			isNavUnificationEnabled: isNavUnificationEnabled( state ),
		};
	},
	{ setNextLayoutFocus, recordTracksEvent, updateSiteMigrationMeta, activateNextLayoutFocus }
)( localize( MasterbarLoggedIn ) );
