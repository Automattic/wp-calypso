/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getCurrentUserId } from 'state/current-user/selectors';
import { canCurrentUser } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import UsersStore from 'lib/users/store';

class SharingConnection extends Component {
	static propTypes = {
		connection: PropTypes.object.isRequired,    // The single connection object
		isDisconnecting: PropTypes.bool,            // Is a service disconnection request pending?
		isRefreshing: PropTypes.bool,               // Is a service refresh request pending?
		onDisconnect: PropTypes.func,               // Handler to invoke when disconnecting
		onRefresh: PropTypes.func,                  // Handler to invoke when refreshing
		onToggleSitewideConnection: PropTypes.func, // Handler to invoke when toggling sitewide connection
		recordGoogleEvent: PropTypes.func,
		service: PropTypes.object.isRequired,       // The service to which the connection is made
		showDisconnect: PropTypes.bool,             // Display an inline disconnect button
		siteId: PropTypes.number,                   // The Id of the current site.
		translate: PropTypes.func,
		userHasCaps: PropTypes.bool,                // Whether the current users has the caps to delete a connection.
		userId: PropTypes.number,                   // The Id of the current user.
	};

	static defaultProps = {
		isDisconnecting: false,
		isRefreshing: false,
		onDisconnect: () => {},
		onRefresh: () => {},
		onToggleSitewideConnection: () => {},
		recordGoogleEvent: () => {},
		showDisconnect: false,
		siteId: 0,
		translate: identity,
		userHasCaps: false,
		userId: 0,
	};

	disconnect = () => {
		if ( ! this.props.isDisconnecting ) {
			this.props.onDisconnect( [ this.props.connection ] );
		}
	};

	refresh = () => {
		if ( ! this.props.isRefreshing ) {
			this.props.onRefresh( this.props.connection );
		}
	};

	toggleSitewideConnection = ( event ) => {
		if ( ! this.state.isSavingSitewide ) {
			const isNowSitewide = event.target.checked;

			this.setState( { isSavingSitewide: true } );
			this.props.onToggleSitewideConnection( this.props.connection, isNowSitewide );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Connection Available to All Users Checkbox',
				this.props.service.ID, isNowSitewide ? 1 : 0 );
		}
	};

	constructor( props ) {
		super( props );

		this.state = {
			isSavingSitewide: false,
		};
	}

	componentDidUpdate( prevProps ) {
		if ( this.state.isSavingSitewide && this.props.connection.shared !== prevProps.connection.shared ) {
			this.setState( { isSavingSitewide: false } );
		}
	}

	getProfileImage() {
		if ( this.props.connection.external_profile_picture ) {
			return <img
				src={ this.props.connection.external_profile_picture }
				alt={ this.props.connection.label }
				className="sharing-connection__account-avatar" />;
		}

		return (
			<span className={ 'sharing-connection__account-avatar is-fallback ' + this.props.connection.service }>
				<span className="screen-reader-text">{ this.props.connection.label }</span>
			</span>
		);
	}

	getReconnectButton() {
		if ( 'broken' === this.props.connection.status && this.props.userId === this.props.connection.keyring_connection_user_ID ) {
			return (
				<a onClick={ this.refresh } className="sharing-connection__account-action reconnect">
					{ this.props.translate( 'Reconnect' ) }
				</a>
			);
		}
	}

	getDisconnectButton() {
		const userCanDelete = this.props.userHasCaps || this.props.connection.user_ID === this.props.userId;

		if ( this.props.showDisconnect && userCanDelete ) {
			return (
				<a onClick={ this.disconnect } className="sharing-connection__account-action disconnect">
					{ this.props.translate( 'Disconnect' ) }
				</a>
			);
		}
	}

	isConnectionShared() {
		return this.state.isSavingSitewide ? ! this.props.connection.shared : this.props.connection.shared;
	}

	getConnectionKeyringUserLabel() {
		const keyringUser = this.props.getUser( this.props.connection.keyring_connection_user_ID );

		if ( keyringUser && userId !== keyringUser.ID ) {
			return (
				<aside className="sharing-connection__keyring-user">
					{ translate( 'Connected by %(username)s', {
						args: { username: keyringUser.nice_name },
						context: 'Sharing: connections'
					} ) }
				</aside>
			);
		}
	}

	getConnectionSitewideElement() {
		if ( 'publicize' !== this.props.service.type ) {
			return;
		}

		const content = [];

		if ( this.props.userHasCaps ) {
			content.push( <input
				key="checkbox"
				type="checkbox"
				checked={ this.isConnectionShared() }
				onChange={ this.toggleSitewideConnection }
				readOnly={ this.state.isSavingSitewide } /> );
		}

		if ( this.props.userHasCaps || this.props.connection.shared ) {
			content.push( <span key="label">
				{ this.props.translate( 'Connection available to all administrators, editors, and authors', {
					context: 'Sharing: Publicize'
				} ) }
			</span> );
		}

		if ( content.length ) {
			return <label className="sharing-connection__account-sitewide-connection">{ content }</label>;
		}
	}

	render() {
		const connectionSitewideElement = this.getConnectionSitewideElement(),
			connectionClasses = classNames( 'sharing-connection', {
				disabled: this.props.isDisconnecting || this.props.isRefreshing
			} ),
			statusClasses = classNames( 'sharing-connection__account-status', {
				'is-shareable': undefined !== connectionSitewideElement
			} );

		return (
			<li className={ connectionClasses }>
				{ this.getProfileImage() }
				<div className={ statusClasses }>
					<span className="sharing-connection__account-name">{ this.props.connection.external_display }</span>
					{ this.getConnectionKeyringUserLabel() }
					{ connectionSitewideElement }
				</div>
				<div className="sharing-connection__account-actions">
					{ this.getReconnectButton() }
					{ this.getDisconnectButton() }
				</div>
			</li>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			userHasCaps: canCurrentUser( state, siteId, 'edit_others_posts' ),
			userId: getCurrentUserId( state ),
			getUser: userId => UsersStore.getUser( getSelectedSiteId( state ), userId ),
		};
	},
	{ recordGoogleEvent },
)( localize( SharingConnection ) );
