/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import MasterbarItem from './masterbar-item';
import MasterbarItemNew from './masterbar-item-new';
import MasterbarItemNotifications from './masterbar-item-notifications';

import Gravatar from 'components/gravatar';
import layoutFocus from 'lib/layout-focus';
import config from 'config';
import paths from 'lib/paths';

import MasterbarLoggedOutMenu from './masterbar-logged-out-menu';
import MasterbarSectionsMenu from './masterbar-sections-menu';
import Notifications from 'notifications';
import store from 'store';

export default React.createClass( {
	displayName: 'Masterbar',

	propTypes: {
		user: React.PropTypes.object,
		section: React.PropTypes.string,
		sites: React.PropTypes.object,
	},

	getInitialState() {
		return {
			animationState: -1, // used to make the notification icon blink
			showNotes: false,   // whether we show the notifications panel
		};
	},

	clickMySites() {
		layoutFocus.setNext( 'sidebar' );
	},

	clickReader() {
		layoutFocus.setNext( 'content' );
	},

	checkIsActive( section ) {
		return !! ( section === this.props.section && ! this.props.showNotes );
	},

	wordpressIcon() {
		// WP icon replacement for "horizon" environment
		if ( config( 'hostname' ) === 'horizon.wordpress.com' ) {
			return 'my-sites-horizon';
		}

		return 'my-sites';
	},

	render() {
		var masterbarClass,
			masterbarClassObject = {
				masterbar: true
			};

		if ( this.props.user ) {
			masterbarClassObject.collapsible = true;
		}

		masterbarClass = classNames( masterbarClassObject );

		if ( this.props.user ) { // Logged in
			return (
				<header id="header" className={ masterbarClass }>
					<MasterbarItem url="/stats" icon={ this.wordpressIcon() } onClick={ this.clickMySites } isActive={ this.checkIsActive( 'sites' ) }>
						{ this.props.user.get().visible_site_count > 1
							? this.translate( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
							: this.translate( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } )
						}
					</MasterbarItem>
					<MasterbarItem url="/" icon="reader" onClick={ this.clickReader } isActive={ this.checkIsActive( 'reader' ) }>
						{ this.translate( 'Reader', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
					</MasterbarItem>

					<MasterbarItemNew sites={ this.props.sites } user={ this.props.user } isActive={ this.checkIsActive( 'post' ) } className="masterbar__item-new">
						{ this.translate( 'New Post' ) }
					</MasterbarItemNew>
					<MasterbarItem url="/me" icon="user-circle" isActive={ this.checkIsActive( 'me' ) } className="masterbar__item-me">
						<Gravatar user={ this.props.user.get() } alt="Me" size={ 18 } />
						<span className="masterbar__item-me-label">{ this.translate( 'Me', { context: 'Toolbar, must be shorter than ~12 chars' } ) }</span>
					</MasterbarItem>
					{/*<MasterbarItem url="/notifications" icon="bell" isActive={ this.checkIsActive( 'notifications' ) } className="masterbar__item-notifications">
						{ this.translate( 'Notifications', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
					</MasterbarItem>*/}
					<MasterbarItemNotifications user={ this.props.user } isActive={ this.checkIsActive( 'notifications' ) } className="masterbar__item-notifications">
						<span className="masterbar__item-notifications-label">{ this.translate( 'Notifications', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }</span>
					</MasterbarItemNotifications>
				</header>
			);
		}

		// Logged out
		return (
			<header id="header" className={ masterbarClass }>
				<MasterbarItem url="/" icon="my-sites" className="masterbar__item-logo">
					WordPress<span className="tld">.com</span>
				</MasterbarItem>
			</header>
		);
	}
} );
