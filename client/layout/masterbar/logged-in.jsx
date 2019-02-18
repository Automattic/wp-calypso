/** @format */
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
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getStatsPathForTab } from 'lib/route';
import { domainManagementList } from 'my-sites/domains/paths';

class MasterbarLoggedIn extends React.Component {
	static propTypes = {
		user: PropTypes.object.isRequired,
		domainOnlySite: PropTypes.bool,
		section: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		setNextLayoutFocus: PropTypes.func.isRequired,
		siteSlug: PropTypes.string,
		hasMoreThanOneSite: PropTypes.bool,
		compact: PropTypes.bool,
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
		const { domainOnlySite, hasMoreThanOneSite, siteSlug, translate } = this.props,
			mySitesUrl = domainOnlySite
				? domainManagementList( siteSlug )
				: getStatsPathForTab( 'day', siteSlug );

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
		const { domainOnlySite, translate, compact } = this.props;

		if ( compact === true ) {
			return <Masterbar>{ this.renderMySites() }</Masterbar>;
		}

		return (
			<Masterbar>
				{ this.renderMySites() }
				<Item
					tipTarget="reader"
					className="masterbar__reader"
					url="/"
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
				{ ! domainOnlySite && (
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
					<Gravatar user={ this.props.user } alt="Me" size={ 18 } />
					<span className="masterbar__item-me-label">
						{ translate( 'Me', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
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
	state => {
		// Falls back to using the user's primary site if no site has been selected
		// by the user yet
		const siteId = getSelectedSiteId( state ) || getPrimarySiteId( state );

		return {
			isNotificationsShowing: isNotificationsOpen( state ),
			siteSlug: getSiteSlug( state, siteId ),
			domainOnlySite: isDomainOnlySite( state, siteId ),
			hasMoreThanOneSite: getCurrentUserSiteCount( state ) > 1,
			user: getCurrentUser( state ),
			isSupportSession: isSupportSession( state ),
		};
	},
	{ setNextLayoutFocus, recordTracksEvent }
)( localize( MasterbarLoggedIn ) );
