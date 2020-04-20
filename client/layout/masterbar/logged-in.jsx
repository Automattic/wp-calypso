/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Masterbar from './masterbar';
import Item from './item';
import Publish from './publish';
import Notifications from './notifications';
import Gravatar from 'components/gravatar';
import config from 'config';
import { preload } from 'sections-helper';
import ResumeEditing from 'my-sites/resume-editing';
import { getCurrentUserSiteCount, getCurrentUser } from 'state/current-user/selectors';
import { isSupportSession } from 'state/support/selectors';
import AsyncLoad from 'components/async-load';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import isNotificationsOpen from 'state/selectors/is-notifications-open';
import isSiteMigrationInProgress from 'state/selectors/is-site-migration-in-progress';
import isSiteMigrationActiveRoute from 'state/selectors/is-site-migration-active-route';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import canCurrentUserUseCustomerHome from 'state/sites/selectors/can-current-user-use-customer-home';
import { getStatsPathForTab } from 'lib/route';
import { domainManagementList } from 'my-sites/domains/paths';
import WordPressWordmark from 'components/wordpress-wordmark';
import getSiteMigrationStatus from 'state/selectors/get-site-migration-status';
import { updateSiteMigrationMeta } from 'state/sites/actions';
import { requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';

class MasterbarLoggedIn extends React.Component {
	static propTypes = {
		user: PropTypes.object.isRequired,
		domainOnlySite: PropTypes.bool,
		section: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		setNextLayoutFocus: PropTypes.func.isRequired,
		siteSlug: PropTypes.string,
		hasMoreThanOneSite: PropTypes.bool,
		isCheckout: PropTypes.bool,
	};

	clickMySites = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_my_sites_clicked' );
		this.props.setNextLayoutFocus( 'sidebar' );

		/**
		 * Site Migration: Reset a failed migration when clicking on My Sites
		 *
		 * If the site migration has failed, clicking on My Sites sends the customer in a loop
		 * until they click the Try Again button on the migration screen.
		 *
		 * This code makes it possible to reset the failed migration state when clicking My Sites too.
		 */
		if ( config.isEnabled( 'tools/migrate' ) ) {
			const { migrationStatus, currentSelectedSiteId } = this.props;

			if ( currentSelectedSiteId && migrationStatus === 'error' ) {
				/**
				 * Reset the in-memory site lock for the currently selected site
				 */
				this.props.updateSiteMigrationMeta( currentSelectedSiteId, 'inactive', null );

				/**
				 * Reset the migration on the backend
				 */
				requestHttpData(
					'site-migration',
					http( {
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						path: `/sites/${ currentSelectedSiteId }/reset-migration`,
						body: {},
					} ),
					{
						freshness: 0,
					}
				);
			}
		}
	};

	clickReader = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_reader_clicked' );
		this.props.setNextLayoutFocus( 'content' );
	};

	clickMe = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_me_clicked' );
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
			} = this.props,
			homeUrl = isCustomerHomeEnabled
				? `/home/${ siteSlug }`
				: getStatsPathForTab( 'day', siteSlug ),
			mySitesUrl = domainOnlySite ? domainManagementList( siteSlug ) : homeUrl;

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
		const { domainOnlySite, translate, isCheckout, isMigrationInProgress } = this.props;

		if ( isCheckout === true ) {
			return (
				<Masterbar>
					<div className="masterbar__secure-checkout">
						<WordPressWordmark className="masterbar__wpcom-wordmark" />
						<span className="masterbar__secure-checkout-text">
							{ translate( 'Secure checkout' ) }
						</span>
					</div>
				</Masterbar>
			);
		}

		return (
			<Masterbar>
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
				{ config.isEnabled( 'resume-editing' ) && <ResumeEditing /> }
				{ ! domainOnlySite && ! isMigrationInProgress && (
					<Publish
						isActive={ this.isActive( 'post' ) }
						className="masterbar__item-new"
						tooltip={ translate( 'Create a New Post' ) }
					>
						{ translate( 'Write' ) }
					</Publish>
				) }
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
						{ translate( 'My Profile', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
					</span>
				</Item>
				<Notifications
					isShowing={ this.props.isNotificationsShowing }
					isActive={ this.isActive( 'notifications' ) }
					className="masterbar__item-notifications"
					tooltip={ translate( 'Manage your notifications' ) }
				>
					<span className="masterbar__item-notifications-label">
						{ translate( 'Notifications', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
					</span>
				</Notifications>
			</Masterbar>
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
		};
	},
	{ setNextLayoutFocus, recordTracksEvent, updateSiteMigrationMeta }
)( localize( MasterbarLoggedIn ) );
