/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Masterbar from './masterbar';
import Item from './item';
import Stats from './stats';
import Publish from './publish';
import Notifications from './notifications';
import Gravatar from 'components/gravatar';
import config from 'config';
import { preload } from 'sections-preload';
import ResumeEditing from 'my-sites/resume-editing';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';

const MasterbarLoggedIn = React.createClass( {
	propTypes: {
		user: React.PropTypes.object,
		sites: React.PropTypes.object,
		section: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.bool ] ),
		setNextLayoutFocus: React.PropTypes.func.isRequired,
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
		return (
			<Masterbar>
				<Stats
					tipTarget="my-sites"
					icon={ this.wordpressIcon() }
					onClick={ this.clickMySites }
					isActive={ this.isActive( 'sites' ) }
					tooltip={ this.translate( 'View a list of your sites and access their dashboards', { textOnly: true } ) }
					preloadSection={ () => preload( 'stats' ) }
				>
					{ this.props.user.get().visible_site_count > 1
						? this.translate( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
						: this.translate( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } )
					}
				</Stats>
				<Item
					tipTarget="reader"
					className="masterbar__reader"
					url="/"
					icon="reader"
					onClick={ this.clickReader }
					isActive={ this.isActive( config.isEnabled( 'reader/refresh-2016-07' ) ? 'reader-refresh' : 'reader' ) }
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
					{ this.translate( 'New Post' ) }
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
export default connect( null, { setNextLayoutFocus }, null, { pure: false } )( MasterbarLoggedIn );
