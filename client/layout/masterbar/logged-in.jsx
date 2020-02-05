/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { __, _x } from '@wordpress/i18n';

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
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import canCurrentUserUseCustomerHome from 'state/sites/selectors/can-current-user-use-customer-home';
import { getStatsPathForTab } from 'lib/route';
import { domainManagementList } from 'my-sites/domains/paths';
import WordPressWordmark from 'components/wordpress-wordmark';

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

	isActive = section => {
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
		const { domainOnlySite, hasMoreThanOneSite, siteSlug, isCustomerHomeEnabled } = this.props,
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
				tooltip={ __( 'View a list of your sites and access their dashboards' ) }
				preloadSection={ this.preloadMySites }
			>
				{ hasMoreThanOneSite
					? __( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
					: __( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
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
						<span className="masterbar__secure-checkout-text">{ __( 'Secure checkout' ) }</span>
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
					tooltip={ __( 'Read the blogs and topics you follow' ) }
					preloadSection={ this.preloadReader }
				>
					{ __( 'Reader' ) }
				</Item>
				{ ( this.props.isSupportSession || config.isEnabled( 'quick-language-switcher' ) ) && (
					<AsyncLoad require="./quick-language-switcher" placeholder={ null } />
				) }
				{ config.isEnabled( 'resume-editing' ) && <ResumeEditing /> }
				{ ! domainOnlySite && ! isMigrationInProgress && (
					<Publish
						isActive={ this.isActive( 'post' ) }
						className="masterbar__item-new"
						tooltip={ __( 'Create a New Post' ) }
					>
						{ __( 'Write' ) }
					</Publish>
				) }
				<Item
					tipTarget="me"
					url="/me"
					icon="user-circle"
					onClick={ this.clickMe }
					isActive={ this.isActive( 'me' ) }
					className="masterbar__item-me"
					tooltip={ __( 'Update your profile, personal settings, and more' ) }
					preloadSection={ this.preloadMe }
				>
					<Gravatar user={ this.props.user } alt={ __( 'My Profile' ) } size={ 18 } />
					<span className="masterbar__item-me-label">
						{ _x( 'My Profile', 'Toolbar, must be shorter than ~12 chars' ) }
					</span>
				</Item>
				<Notifications
					isShowing={ this.props.isNotificationsShowing }
					isActive={ this.isActive( 'notifications' ) }
					className="masterbar__item-notifications"
					tooltip={ __( 'Manage your notifications' ) }
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
	state => {
		// Falls back to using the user's primary site if no site has been selected
		// by the user yet
		const siteId = getSelectedSiteId( state ) || getPrimarySiteId( state );

		return {
			isCustomerHomeEnabled: canCurrentUserUseCustomerHome( state, siteId ),
			isNotificationsShowing: isNotificationsOpen( state ),
			siteSlug: getSiteSlug( state, siteId ),
			domainOnlySite: isDomainOnlySite( state, siteId ),
			hasMoreThanOneSite: getCurrentUserSiteCount( state ) > 1,
			user: getCurrentUser( state ),
			isSupportSession: isSupportSession( state ),
			isMigrationInProgress: !! isSiteMigrationInProgress( state, siteId ),
		};
	},
	{ setNextLayoutFocus, recordTracksEvent }
)( localize( MasterbarLoggedIn ) );
