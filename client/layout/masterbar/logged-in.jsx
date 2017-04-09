/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Masterbar from './masterbar';
import Item from './item';
import Publish from './publish';
import Notifications from './notifications';
import Gravatar from 'components/gravatar';
import config from 'config';
import { preload } from 'sections-preload';
import ResumeEditing from 'my-sites/resume-editing';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getStatsPathForTab } from 'lib/route/path';
import { getCurrentUser } from 'state/current-user/selectors';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import { domainManagementList } from 'my-sites/upgrades/paths';

const MasterbarLoggedIn = React.createClass( {
	propTypes: {
		domainOnlySite: React.PropTypes.bool,
		user: React.PropTypes.object,
		sites: React.PropTypes.object,
		section: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.bool ] ),
		setNextLayoutFocus: React.PropTypes.func.isRequired,
		siteSlug: React.PropTypes.string,
	},

	getInitialState() {
		return {
			// whether we show the notifications panel
			showNotifications: false,
		};
	},

	clickMySites() {
		this.props.setNextLayoutFocus( 'sidebar' );
	},

	clickReader() {
		this.props.setNextLayoutFocus( 'content' );
	},

	clickNotifications() {
		this.setState( {
			showNotifications: ! this.state.showNotifications
		} );
	},

	isActive( section ) {
		return section === this.props.section && ! this.state.showNotifications;
	},

	wordpressIcon() {
		// WP icon replacement for "horizon" environment
		if ( config( 'hostname' ) === 'horizon.wordpress.com' ) {
			return 'my-sites-horizon';
		}

		return 'my-sites';
	},

	render() {
		const { domainOnlySite, siteSlug } = this.props,
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
					tooltip={ this.translate( 'View a list of your sites and access their dashboards', { textOnly: true } ) }
					preloadSection={ () => preload( domainOnlySite ? 'upgrades' : 'stats' ) }
				>
					{ this.props.user.get().visible_site_count > 1
						? this.translate( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
						: this.translate( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } )
					}
				</Item>
				<Item
					tipTarget="reader"
					className="masterbar__reader"
					url="/"
					icon="reader"
					onClick={ this.clickReader }
					isActive={ this.isActive( 'reader' ) }
					tooltip={ this.translate( 'Read the blogs and topics you follow', { textOnly: true } ) }
					preloadSection={ () => preload( 'reader' ) }
				>
					{ this.translate( 'Reader', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
				</Item>
				{ config.isEnabled( 'resume-editing' ) && <ResumeEditing /> }
				<Publish
					sites={ this.props.sites }
					user={ this.props.user }
					isActive={ this.isActive( 'post' ) }
					className="masterbar__item-new"
					tooltip={ this.translate( 'Create a New Post', { textOnly: true } ) }
				>
					{ this.translate( 'Write' ) }
				</Publish>
				<Item
					tipTarget="me"
					url="/me"
					icon="user-circle"
					isActive={ this.isActive( 'me' ) }
					className="masterbar__item-me"
					tooltip={ this.translate( 'Update your profile, personal settings, and more', { textOnly: true } ) }
					preloadSection={ () => preload( 'me' ) }
				>
					<Gravatar user={ this.props.user.get() } alt="Me" size={ 18 } />
					<span className="masterbar__item-me-label">
						{ this.translate( 'Me', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
					</span>
				</Item>
				<Notifications
					user={ this.props.user }
					onClick={ this.clickNotifications }
					isActive={ this.isActive( 'notifications' ) }
					className="masterbar__item-notifications"
					tooltip={ this.translate( 'Manage your notifications', { textOnly: true } ) }
				>
					<span className="masterbar__item-notifications-label">{ this.translate( 'Notifications', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }</span>
				</Notifications>
			</Masterbar>
		);
	}
} );

// TODO: make this pure when sites can be retrieved from the Redux state
export default connect( ( state, { sites } ) => {
	let siteId = getSelectedSiteId( state );

	if ( ! siteId ) {
		// Falls back to using the user's primary site if no site has been selected by the user yet
		siteId = get( getCurrentUser( state ), 'primary_blog' );
	}

	let siteSlug = getSiteSlug( state, siteId );
	let domainOnlySite = false;

	if ( siteSlug ) {
		domainOnlySite = isDomainOnlySite( state, siteId );
	} else {
		// Retrieves the site from the Sites store when the global state tree doesn't contain the list of sites yet
		const site = sites.getSite( siteId );

		if ( site ) {
			siteSlug = site.slug;
			domainOnlySite = get( site, 'options.is_domain_only', false );
		}
	}

	return {
		siteSlug,
		domainOnlySite
	};
}, { setNextLayoutFocus }, null, { pure: false } )( MasterbarLoggedIn );
