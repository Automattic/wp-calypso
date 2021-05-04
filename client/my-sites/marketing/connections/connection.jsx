/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import Gridicon from 'calypso/components/gridicon';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { ScreenReaderText } from '@automattic/components';

class SharingConnection extends Component {
	static propTypes = {
		connection: PropTypes.object.isRequired, // The single connection object
		isDisconnecting: PropTypes.bool, // Is a service disconnection request pending?
		isRefreshing: PropTypes.bool, // Is a service refresh request pending?
		onDisconnect: PropTypes.func, // Handler to invoke when disconnecting
		onRefresh: PropTypes.func, // Handler to invoke when refreshing
		onToggleSitewideConnection: PropTypes.func, // Handler to invoke when toggling sitewide connection
		recordGoogleEvent: PropTypes.func,
		service: PropTypes.object.isRequired, // The service to which the connection is made
		showDisconnect: PropTypes.bool, // Display an inline disconnect button
		siteId: PropTypes.number, // The Id of the current site.
		translate: PropTypes.func,
		userHasCaps: PropTypes.bool, // Whether the current users has the caps to delete a connection.
		userId: PropTypes.number, // The Id of the current user.
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
		userHasCaps: false,
		userId: 0,
		defaultServiceIcon: {
			google_my_business: 'institution',
		},
	};

	disconnect = () => {
		if ( ! this.props.isDisconnecting ) {
			this.props.onDisconnect( [ this.props.connection ] );
		}
	};

	refresh = () => {
		if ( ! this.props.isRefreshing ) {
			this.props.onRefresh( [ this.props.connection ] );
		}
	};

	toggleSitewideConnection = ( event ) => {
		const { path } = this.props;

		if ( ! this.state.isSavingSitewide ) {
			const isNowSitewide = event.target.checked ? 1 : 0;

			this.setState( { isSavingSitewide: true } );
			this.props.onToggleSitewideConnection( this.props.connection, isNowSitewide );
			this.props.recordTracksEvent( 'calypso_connections_connection_sitewide_checkbox_clicked', {
				is_now_sitewide: isNowSitewide,
				path,
			} );
			this.props.recordGoogleEvent(
				'Sharing',
				'Clicked Connection Available to All Users Checkbox',
				this.props.service.ID,
				isNowSitewide
			);
		}
	};

	constructor( props ) {
		super( props );

		this.state = {
			isSavingSitewide: false,
		};
	}

	componentDidUpdate( prevProps ) {
		if (
			this.state.isSavingSitewide &&
			this.props.connection.shared !== prevProps.connection.shared
		) {
			this.setState( { isSavingSitewide: false } );
		}
	}

	getProfileImage() {
		if ( this.props.connection.external_profile_picture ) {
			return (
				<img
					src={ this.props.connection.external_profile_picture }
					alt={ this.props.connection.label }
					className="sharing-connection__account-avatar"
				/>
			);
		}

		return (
			<span
				className={
					'sharing-connection__account-avatar is-fallback ' + this.props.connection.service
				}
			>
				{ this.props.defaultServiceIcon[ this.props.connection.service ] && (
					<Gridicon
						icon={ this.props.defaultServiceIcon[ this.props.connection.service ] }
						size={ 36 }
					/>
				) }
				<ScreenReaderText>{ this.props.connection.label }</ScreenReaderText>
			</span>
		);
	}

	getReconnectButton() {
		if (
			'broken' === this.props.connection.status &&
			this.props.userId === this.props.connection.keyring_connection_user_ID
		) {
			return (
				<a onClick={ this.refresh } className="sharing-connection__account-action reconnect">
					<Gridicon icon="notice" size={ 18 } />
					{ this.props.translate( 'Reconnect' ) }
				</a>
			);
		}
	}

	getDisconnectButton() {
		const userCanDelete =
			this.props.userHasCaps || this.props.connection.user_ID === this.props.userId;

		if ( this.props.showDisconnect && userCanDelete ) {
			return (
				<a onClick={ this.disconnect } className="sharing-connection__account-action disconnect">
					{ this.props.translate( 'Disconnect' ) }
				</a>
			);
		}
	}

	isConnectionShared() {
		return this.state.isSavingSitewide
			? ! this.props.connection.shared
			: this.props.connection.shared;
	}

	getConnectionSitewideElement() {
		if ( 'publicize' !== this.props.service.type ) {
			return;
		}

		const content = [];

		if ( this.props.userHasCaps ) {
			content.push(
				<FormInputCheckbox
					key="checkbox"
					checked={ this.isConnectionShared() }
					onChange={ this.toggleSitewideConnection }
					readOnly={ this.state.isSavingSitewide }
				/>
			);
		}

		if ( this.props.userHasCaps || this.props.connection.shared ) {
			content.push(
				<span key="label">
					{ this.props.translate(
						'Connection available to all administrators, editors, and authors',
						{
							context: 'Sharing: Publicize',
						}
					) }
				</span>
			);
		}

		if ( content.length ) {
			return (
				<FormLabel className="sharing-connection__account-sitewide-connection">
					{ content }
				</FormLabel>
			);
		}
	}

	render() {
		const connectionSitewideElement = this.getConnectionSitewideElement();
		const connectionClasses = classNames( 'sharing-connection', {
			disabled: this.props.isDisconnecting || this.props.isRefreshing,
		} );
		const statusClasses = classNames( 'sharing-connection__account-status', {
			'is-shareable': undefined !== connectionSitewideElement,
		} );

		return (
			<li className={ connectionClasses }>
				{ this.getProfileImage() }
				<div className={ statusClasses }>
					<span className="sharing-connection__account-name">
						{ this.props.connection.external_display }
					</span>
					<SharingConnectionKeyringUserLabel
						siteId={ this.props.siteId }
						keyringUserId={ this.props.connection?.keyring_connection_user_ID ?? null }
						userId={ this.props.userId }
					/>
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

const SharingConnectionKeyringUserLabel = localize(
	( { siteId, keyringUserId, translate, userId } ) => {
		const fetchOptions = {
			search: keyringUserId,
			search_columns: [ 'ID' ],
		};

		const { data } = useUsersQuery( siteId, fetchOptions );
		const keyringUser = data?.users?.[ 0 ] ?? null;

		if ( keyringUser && userId !== keyringUser.ID ) {
			return (
				<aside className="sharing-connection__keyring-user">
					{ translate( 'Connected by %(username)s', {
						args: { username: keyringUser.nice_name },
						context: 'Sharing: connections',
					} ) }
				</aside>
			);
		}

		return null;
	}
);

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			userHasCaps: canCurrentUser( state, siteId, 'edit_others_posts' ),
			userId: getCurrentUserId( state ),
			path: getCurrentRouteParameterized( state, siteId ),
		};
	},
	{ recordGoogleEvent, recordTracksEvent }
)( localize( SharingConnection ) );
