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

export default React.createClass( {
	displayName: 'Masterbar',

	propTypes: {
		user: React.PropTypes.object,
		sites: React.PropTypes.object,
		section: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.bool ] ),
	},

	getInitialState() {
		return {
			showNotifications: false,   // whether we show the notifications panel
		};
	},

	clickMySites() {
		layoutFocus.setNext( 'sidebar' );
	},

	clickReader() {
		layoutFocus.setNext( 'content' );
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
		const classes = classNames( 'masterbar', {
			collapsible: !! this.props.user,
		} );

		if ( this.props.user ) { // Logged in
			return (
				<header id="header" className={ classes }>
					<MasterbarItem url="/stats" icon={ this.wordpressIcon() } onClick={ this.clickMySites } isActive={ this.isActive( 'sites' ) }>
						{ this.props.user.get().visible_site_count > 1
							? this.translate( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
							: this.translate( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } )
						}
					</MasterbarItem>
					<MasterbarItem url="/" icon="reader" onClick={ this.clickReader } isActive={ this.isActive( 'reader' ) }>
						{ this.translate( 'Reader', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
					</MasterbarItem>

					<MasterbarItemNew sites={ this.props.sites } user={ this.props.user } isActive={ this.isActive( 'post' ) } className="masterbar__item-new">
						{ this.translate( 'New Post' ) }
					</MasterbarItemNew>
					<MasterbarItem url="/me" icon="user-circle" isActive={ this.isActive( 'me' ) } className="masterbar__item-me">
						<Gravatar user={ this.props.user.get() } alt="Me" size={ 18 } />
						<span className="masterbar__item-me-label">{ this.translate( 'Me', { context: 'Toolbar, must be shorter than ~12 chars' } ) }</span>
					</MasterbarItem>
					<MasterbarItemNotifications user={ this.props.user } onClick={ this.clickNotifications } isActive={ this.isActive( 'notifications' ) } className="masterbar__item-notifications">
						<span className="masterbar__item-notifications-label">{ this.translate( 'Notifications', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }</span>
					</MasterbarItemNotifications>
				</header>
			);
		}

		// Logged out
		return (
			<header id="header" className={ classes }>
				<MasterbarItem url="/" icon="my-sites" className="masterbar__item-logo">
					WordPress<span className="tld">.com</span>
				</MasterbarItem>
			</header>
		);
	}
} );
