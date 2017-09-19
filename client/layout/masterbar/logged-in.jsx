/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Item from './item';
import Masterbar from './masterbar';
import Notifications from './notifications';
import Publish from './publish';
import Gravatar from 'components/gravatar';
import config from 'config';
import { getStatsPathForTab } from 'lib/route/path';
import { domainManagementList } from 'my-sites/domains/paths';
import ResumeEditing from 'my-sites/resume-editing';
import { preload } from 'sections-preload';
import { isNotificationsOpen } from 'state/selectors';
import { getPrimarySiteId } from 'state/selectors';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import { getSiteSlug } from 'state/sites/selectors';
import { getSite } from 'state/sites/selectors';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

const MasterbarLoggedIn = React.createClass( {
	propTypes: {
		domainOnlySite: PropTypes.bool,
		user: PropTypes.object,
		sites: PropTypes.object,
		section: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		setNextLayoutFocus: PropTypes.func.isRequired,
		siteSlug: PropTypes.string,
	},

	clickMySites() {
		this.props.setNextLayoutFocus( 'sidebar' );
	},

	clickReader() {
		this.props.setNextLayoutFocus( 'content' );
	},

	isActive( section ) {
		return section === this.props.section && ! this.props.isNotificationsShowing;
	},

	wordpressIcon() {
		// WP icon replacement for "horizon" environment
		if ( config( 'hostname' ) === 'horizon.wordpress.com' ) {
			return 'my-sites-horizon';
		}

		return 'my-sites';
	},

	render() {
		const { domainOnlySite, siteSlug, translate } = this.props,
			mySitesUrl = domainOnlySite
				? domainManagementList( siteSlug )
				: getStatsPathForTab( 'day', siteSlug );

		return (
			<Masterbar>
				<Item
					url={ mySitesUrl }
					tipTarget="my-sites"
					icon={ this.wordpressIcon() }
					onClick={ this.clickMySites }
					isActive={ this.isActive( 'sites' ) }
					tooltip={ translate( 'View a list of your sites and access their dashboards', { textOnly: true } ) }
					preloadSection={ () => preload( domainOnlySite ? 'domains' : 'stats' ) }
				>
					{ this.props.user.get().site_count > 1
						? translate( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
						: translate( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } )
					}
				</Item>
				<Item
					tipTarget="reader"
					className="masterbar__reader"
					url="/"
					icon="reader"
					onClick={ this.clickReader }
					isActive={ this.isActive( 'reader' ) }
					tooltip={ translate( 'Read the blogs and topics you follow', { textOnly: true } ) }
					preloadSection={ () => preload( 'reader' ) }
				>
					{ translate( 'Reader', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
				</Item>
				{ config.isEnabled( 'resume-editing' ) && <ResumeEditing /> }
				{ ! domainOnlySite &&
					<Publish
						user={ this.props.user }
						isActive={ this.isActive( 'post' ) }
						className="masterbar__item-new"
						tooltip={ translate( 'Create a New Post', { textOnly: true } ) }
					>
						{ translate( 'Write' ) }
					</Publish>
				}
				<Item
					tipTarget="me"
					url="/me"
					icon="user-circle"
					isActive={ this.isActive( 'me' ) }
					className="masterbar__item-me"
					tooltip={ translate( 'Update your profile, personal settings, and more', { textOnly: true } ) }
					preloadSection={ () => preload( 'me' ) }
				>
					<Gravatar user={ this.props.user.get() } alt="Me" size={ 18 } />
					<span className="masterbar__item-me-label">
						{ translate( 'Me', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
					</span>
				</Item>
				<Notifications
					user={ this.props.user }
					isShowing={ this.props.isNotificationsShowing }
					isActive={ this.isActive( 'notifications' ) }
					className="masterbar__item-notifications"
					tooltip={ translate( 'Manage your notifications', { textOnly: true } ) }
				>
					<span className="masterbar__item-notifications-label">
						{ translate( 'Notifications', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
					</span>
				</Notifications>
			</Masterbar>
		);
	}
} );

export default connect( ( state ) => {
	// Falls back to using the user's primary site if no site has been selected
	// by the user yet
	const siteId = getSelectedSiteId( state ) || getPrimarySiteId( state );

	let siteSlug = getSiteSlug( state, siteId );
	let domainOnlySite = false;

	if ( siteSlug ) {
		domainOnlySite = isDomainOnlySite( state, siteId );
	} else {
		// Retrieves the site from the Sites store when the global state tree doesn't contain the list of sites yet
		const site = getSite( state, siteId );

		if ( site ) {
			siteSlug = site.slug;
			domainOnlySite = get( site, 'options.is_domain_only', false );
		}
	}

	return {
		isNotificationsShowing: isNotificationsOpen( state ),
		siteSlug,
		domainOnlySite
	};
}, { setNextLayoutFocus } )( localize( MasterbarLoggedIn ) );
