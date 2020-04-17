/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { identity, isEqual, find, replace, some, isFunction, get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AccountDialog from './account-dialog';
import {
	createSiteConnection,
	deleteSiteConnection,
	failCreateConnection,
	fetchConnection,
	updateSiteConnection,
} from 'state/sharing/publicize/actions';
import { successNotice, errorNotice, warningNotice } from 'state/notices/actions';
import Connection from './connection';
import FoldableCard from 'components/foldable-card';
import Notice from 'components/notice';
import { getAvailableExternalAccounts } from 'state/sharing/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import {
	getKeyringConnectionsByName,
	getBrokenKeyringConnectionsByName,
} from 'state/sharing/keyring/selectors';
import {
	getBrokenSiteUserConnectionsForService,
	getRemovableConnections,
	getSiteUserConnectionsForService,
	isFetchingConnections,
} from 'state/sharing/publicize/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import getCurrentRouteParameterized from 'state/selectors/get-current-route-parameterized';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';
import ServiceAction from './service-action';
import ServiceConnectedAccounts from './service-connected-accounts';
import ServiceDescription from './service-description';
import ServiceExamples from './service-examples';
import ServiceTip from './service-tip';
import requestExternalAccess from 'lib/sharing';
import MailchimpSettings, { renderMailchimpLogo } from './mailchimp-settings';
import config from 'config';
import PicasaMigration from './picasa-migration';
import SocialLogo from 'components/social-logo';

/**
 * Check if the connection is broken or requires reauth.
 *
 * @param {object} connection Publicize connection.
 * @returns {boolean} True if connection is broken or requires reauthentication.
 */
const isConnectionInvalidOrMustReauth = connection =>
	[ 'must_reauth', 'invalid' ].includes( connection.status );

export class SharingService extends Component {
	static propTypes = {
		availableExternalAccounts: PropTypes.arrayOf( PropTypes.object ),
		brokenConnections: PropTypes.arrayOf( PropTypes.object ),
		createSiteConnection: PropTypes.func,
		deleteSiteConnection: PropTypes.func,
		errorNotice: PropTypes.func,
		failCreateConnection: PropTypes.func,
		fetchConnection: PropTypes.func,
		isFetching: PropTypes.bool,
		keyringConnections: PropTypes.arrayOf( PropTypes.object ),
		recordGoogleEvent: PropTypes.func,
		recordTracksEvent: PropTypes.func,
		removableConnections: PropTypes.arrayOf( PropTypes.object ),
		service: PropTypes.object.isRequired, // The single service object
		siteId: PropTypes.number, // The site ID for which connections are created
		siteUserConnections: PropTypes.arrayOf( PropTypes.object ),
		translate: PropTypes.func,
		updateSiteConnection: PropTypes.func,
		warningNotice: PropTypes.func,
	};

	static defaultProps = {
		availableExternalAccounts: [],
		brokenConnections: [],
		createSiteConnection: () => {},
		deleteSiteConnection: () => {},
		errorNotice: () => {},
		failCreateConnection: () => {},
		fetchConnection: () => {},
		isFetching: false,
		keyringConnections: [],
		recordGoogleEvent: () => {},
		requestKeyringConnections: () => {},
		removableConnections: [],
		siteId: 0,
		siteUserConnections: [],
		translate: identity,
		updateSiteConnection: () => {},
		warningNotice: () => {},
	};

	/**
	 * Triggers an action based on the current connection status.
	 */
	performAction = () => {
		const connectionStatus = this.getConnectionStatus( this.props.service.ID );
		const { path } = this.props;

		// Depending on current status, perform an action when user clicks the
		// service action button
		if (
			( 'connected' === connectionStatus && this.canRemoveConnection() ) ||
			'must-disconnect' === connectionStatus
		) {
			this.removeConnection();
			this.props.recordTracksEvent( 'calypso_connections_disconnect_button_click', {
				service: this.props.service.ID,
				path,
			} );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Disconnect Button', this.props.service.ID );
		} else if ( 'reconnect' === connectionStatus ) {
			this.refresh();
			this.props.recordTracksEvent( 'calypso_connections_reconnect_button_click', {
				service: this.props.service.ID,
				path,
			} );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Reconnect Button', this.props.service.ID );
		} else {
			this.addConnection( this.props.service, this.state.newKeyringId );
			this.props.recordTracksEvent( 'calypso_connections_connect_button_click', {
				service: this.props.service.ID,
				path,
			} );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Connect Button', this.props.service.ID );
		}
	};

	/**
	 * Handle external access provided by the user.
	 *
	 * @param {number} keyringConnectionId Keyring connection ID.
	 */
	externalAccessProvided = keyringConnectionId => {}; // eslint-disable-line no-unused-vars

	/**
	 * Establishes a new connection.
	 *
	 * @param {object} service             Service to connect to.
	 * @param {number} keyringConnectionId Keyring conneciton ID.
	 * @param {number} externalUserId      Optional. User ID for the service. Default: 0.
	 */
	addConnection = ( service, keyringConnectionId, externalUserId = 0 ) => {
		this.setState( { isConnecting: true } );

		const { path } = this.props;

		if ( service ) {
			if ( keyringConnectionId ) {
				// Since we have a Keyring connection to work with, we can immediately
				// create or update the connection
				this.createOrUpdateConnection( keyringConnectionId, externalUserId );
				this.props.recordTracksEvent( 'calypso_connections_connect_button_in_modal_click', {
					service: this.props.service.ID,
					path,
				} );
				this.props.recordGoogleEvent(
					'Sharing',
					'Clicked Connect Button in Modal',
					this.props.service.ID
				);
			} else {
				// Attempt to create a new connection. If a Keyring connection ID
				// is not provided, the user will need to authorize the app
				requestExternalAccess( service.connect_URL, ( { keyring_id: newKeyringId } ) => {
					// When the user has finished authorizing the connection
					// (or otherwise closed the window), force a refresh
					this.props.requestKeyringConnections();

					// In the case that a Keyring connection doesn't exist, wait for app
					// authorization to occur, then display with the available connections
					this.setState( { isAwaitingConnections: true } );

					this.externalAccessProvided( newKeyringId );
				} );
			}
		} else {
			// If an account wasn't selected from the dialog or the user cancels
			// the connection, the dialog should simply close
			this.props.warningNotice(
				this.props.translate( 'The connection could not be made because no account was selected.', {
					comment: 'Warning notice when sharing connection dialog was closed without selection',
				} ),
				{ id: 'publicize' }
			);
			this.setState( { isConnecting: false } );
			this.props.recordTracksEvent( 'calypso_connections_cancel_button_in_modal_click', {
				service: this.props.service.ID,
				path,
			} );
			this.props.recordGoogleEvent(
				'Sharing',
				'Clicked Cancel Button in Modal',
				this.props.service.ID
			);
		}

		// Reset active account selection
		this.setState( { isSelectingAccount: false } );
	};

	/**
	 * Create or update the connection
	 *
	 * @param {number} keyringConnectionId Keyring conneciton ID.
	 * @param {number} externalUserId      Optional. User ID for the service. Default: 0.
	 */
	createOrUpdateConnection = ( keyringConnectionId, externalUserId = 0 ) => {
		const existingConnection = find( this.props.siteUserConnections, {
			keyring_connection_ID: keyringConnectionId,
		} );

		if ( this.props.siteId && existingConnection ) {
			// If a Keyring connection is already in use by another connection,
			// we should trigger an update. There should only be one connection,
			// so we're correct in using the connection ID from the first
			this.props.updateSiteConnection( existingConnection, { external_user_ID: externalUserId } );
		} else {
			this.props.createSiteConnection( this.props.siteId, keyringConnectionId, externalUserId );
		}
	};

	connectAnother = () => {
		const { path } = this.props;

		this.props.recordTracksEvent( 'calypso_connections_connect_another_button_click', {
			service: this.props.service.ID,
			path,
		} );
		this.props.recordGoogleEvent(
			'Sharing',
			'Clicked Connect Another Account Button',
			this.props.service.ID
		);
		this.addConnection( this.props.service );
	};

	/**
	 * Sets a connection to be site-wide or not.
	 *
	 * @param  {object}   connection Connection to update.
	 * @param  {boolean}  shared     Whether the connection can be used by other users.
	 * @returns {Function}            Action thunk
	 */
	toggleSitewideConnection = ( connection, shared ) =>
		this.props.updateSiteConnection( connection, { shared } );

	/**
	 * Lets users re-authenticate their Keyring connections if lost.
	 *
	 * @param {Array} connections Optional. Broken connections.
	 *                            Default: All broken connections for this service.
	 */
	refresh = ( connections = this.props.brokenConnections ) => {
		this.getConnections( connections ).map( connection => {
			const keyringConnection = find( this.props.keyringConnections, token => {
				// Publicize connections store the token id as `keyring_connection_ID`
				const tokenID =
					'publicize' === token.type ? connection.keyring_connection_ID : connection.ID;
				return token.ID === tokenID;
			} );

			if ( keyringConnection ) {
				this.setState( { isRefreshing: true } );

				// Attempt to create a new connection. If a Keyring connection ID
				// is not provided, the user will need to authorize the app
				requestExternalAccess( connection.refresh_URL, () => {
					// When the user has finished authorizing the connection
					// (or otherwise closed the window), force a refresh
					const reFetchConnections = [
						this.fetchConnection( connection ),
						this.props.requestKeyringConnections(),
					];
					Promise.all( reFetchConnections ).then( () => {
						this.setState( { isRefreshing: false } );
					} );
				} );
			} else {
				this.props.errorNotice(
					this.props.translate( 'The %(service)s account was unable to be reconnected.', {
						args: { service: this.props.service.label },
						context: 'Sharing: Publicize reconnection confirmation',
					} ),
					{ id: 'publicize' }
				);
			}
		} );
	};

	/**
	 * Fetch connections
	 *
	 * @param {object} connection Connection to update.
	 * @returns {Function} Action thunk
	 */
	fetchConnection = connection => this.props.fetchConnection( this.props.siteId, connection.ID );

	/**
	 * Checks whether any connection can be removed.
	 *
	 * @returns {boolean} true if there's any removable; otherwise, false.
	 */
	canRemoveConnection = () => {
		return this.props.removableConnections.length > 0;
	};

	/**
	 * Deletes the passed connections.
	 *
	 * @param {Array} connections Optional. Connections to be deleted.
	 *                            Default: All connections for this service.
	 */
	removeConnection = ( connections = this.props.removableConnections ) => {
		this.setState( { isDisconnecting: true } );
		connections.map( this.props.deleteSiteConnection );
	};

	constructor() {
		super( ...arguments );

		this.state = {
			isOpen: false, // The service is visually opened
			isConnecting: false, // A pending connection is awaiting authorization
			isDisconnecting: false, // A pending disconnection is awaiting completion
			isRefreshing: false, // A pending refresh is awaiting completion
			isSelectingAccount: false, // The modal to select an account is open
			isAwaitingConnections: false, // Waiting for Keyring Connections request to finish
		};
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props.siteUserConnections, nextProps.siteUserConnections ) ) {
			this.setState( {
				isConnecting: false,
				isDisconnecting: false,
				isSelectingAccount: false,
			} );
		}

		if ( ! isEqual( this.props.brokenConnections, nextProps.brokenConnections ) ) {
			this.setState( { isRefreshing: false } );
		}

		if ( this.state.isAwaitingConnections ) {
			this.setState( { isAwaitingConnections: false } );

			/**
			 * This immediately connects the account, which is needed for non-publicize accounts
			 */
			if (
				get( nextProps, 'service.type' ) !== 'publicize' &&
				this.didKeyringConnectionSucceed( nextProps.availableExternalAccounts )
			) {
				const account = find( nextProps.availableExternalAccounts, { isConnected: false } );
				this.addConnection( nextProps.service, account.keyringConnectionId );
				this.setState( { isConnecting: false } );
			} else if ( this.didKeyringConnectionSucceed( nextProps.availableExternalAccounts ) ) {
				this.setState( { isSelectingAccount: true } );
			}
		}
	}

	/**
	 * Get current connections
	 *
	 * @param  {Array} overrides Optional. If it is passed, just return the argument
	 *                           instead of the default connections.
	 * @returns {Array} connections
	 */
	getConnections( overrides ) {
		return overrides || this.props.siteUserConnections;
	}

	/**
	 * Given a service name and optional site ID, returns the current status of the
	 * service's connection.
	 *
	 * @param {string} service The name of the service to check
	 * @returns {string} Connection status.
	 */
	getConnectionStatus( service ) {
		let status;

		if ( this.props.isFetching ) {
			// When connections are still loading, we don't know the status
			status = 'unknown';
		} else if ( ! some( this.getConnections(), { service } ) ) {
			// If no connections exist, the service isn't connected
			status = 'not-connected';
		} else if ( some( this.getConnections(), { status: 'broken' } ) ) {
			// A problematic connection exists
			status = 'reconnect';
		} else if ( some( this.getConnections(), isConnectionInvalidOrMustReauth ) ) {
			// A valid connection is not available anymore, user must reconnect
			status = 'must-disconnect';
		} else {
			// If all else passes, assume service is connected
			status = 'connected';
		}

		return status;
	}

	/**
	 * Given a service name and optional site ID, returns whether the Keyring
	 * authorization attempt succeeded in creating new Keyring account options.
	 *
	 * @param {Array} externalAccounts Props to check on if a keyring connection succeeded.
	 * @returns {boolean} Whether the Keyring authorization attempt succeeded
	 */
	didKeyringConnectionSucceed( externalAccounts ) {
		const hasAnyConnectionOptions = some( externalAccounts, { isConnected: false } );

		if ( ! externalAccounts.length ) {
			// At this point, if there are no available accounts to
			// select, we must assume the user closed the popup
			// before completing the authorization step.
			this.props.failCreateConnection( {
				message: this.props.translate(
					'The %(service)s connection could not be made because no account was selected.',
					{
						args: { service: this.props.service.label },
						context: 'Sharing: Publicize connection confirmation',
					}
				),
			} );
			this.setState( { isConnecting: false } );
		} else if ( ! hasAnyConnectionOptions ) {
			// Similarly warn user if all options are connected
			this.props.failCreateConnection( {
				message: this.props.translate(
					'The %(service)s connection could not be made because all available accounts are already connected.',
					{
						args: { service: this.props.service.label },
						context: 'Sharing: Publicize connection confirmation',
					}
				),
			} );
			this.setState( { isConnecting: false } );
		}
		this.setState( { justConnected: true } );

		return externalAccounts.length && hasAnyConnectionOptions;
	}

	renderLogo() {
		return (
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			<SocialLogo
				icon={ replace( this.props.service.ID, /_/g, '-' ) }
				size={ 48 }
				className="sharing-service__logo"
			/>
		);
	}

	shouldBeExpanded( status ) {
		if ( this.isMailchimpService() && this.state.justConnected ) {
			return true;
		}

		if ( this.isPicasaMigration( status ) ) {
			return true;
		}

		return false;
	}

	isMailchimpService = () => {
		if ( ! config.isEnabled( 'mailchimp' ) ) {
			return false;
		}
		return get( this, 'props.service.ID' ) === 'mailchimp';
	};

	isPicasaMigration( status ) {
		if ( status === 'must-disconnect' && get( this, 'props.service.ID' ) === 'google_photos' ) {
			return true;
		}

		return false;
	}

	render() {
		const connections = this.getConnections();
		const connectionStatus = this.getConnectionStatus( this.props.service.ID );
		const classNames = classnames( 'sharing-service', this.props.service.ID, connectionStatus, {
			'is-open': this.state.isOpen,
		} );
		const accounts = this.state.isSelectingAccount ? this.props.availableExternalAccounts : [];

		const header = (
			<div>
				{ ! this.isMailchimpService( connectionStatus ) && this.renderLogo() }
				{ this.isMailchimpService( connectionStatus ) && renderMailchimpLogo() }

				<div className="sharing-service__name">
					<h2>{ this.props.service.label }</h2>
					<ServiceDescription
						service={ this.props.service }
						status={ connectionStatus }
						numberOfConnections={ this.getConnections().length }
					/>
				</div>
				{ 'linkedin' === this.props.service.ID && some( connections, { status: 'must_reauth' } ) && (
					<Notice isCompact status="is-error" className="sharing-service__notice">
						{ this.props.translate(
							'Time to reauthenticate! Some changes to LinkedIn mean that you need to re-enable Publicize ' +
								'by disconnecting and reconnecting your account.'
						) }
					</Notice>
				) }
			</div>
		);

		const action = (
			<ServiceAction
				status={ connectionStatus }
				service={ this.props.service }
				onAction={ this.performAction }
				isConnecting={ this.state.isConnecting }
				isRefreshing={ this.state.isRefreshing }
				isDisconnecting={ this.state.isDisconnecting }
			/>
		);

		return (
			<li>
				<AccountDialog
					isVisible={ this.state.isSelectingAccount }
					service={ this.props.service }
					accounts={ accounts }
					onAccountSelected={ this.addConnection }
					disclaimerText={ this.getDisclamerText && this.getDisclamerText() }
				/>
				<FoldableCard
					className={ classNames }
					header={ header }
					clickableHeader
					//For Mailchimp we want to open settings, because in other services we have the popup.
					expanded={ this.shouldBeExpanded( connectionStatus ) }
					compact
					summary={ action }
					expandedSummary={ action }
				>
					<div
						className={ classnames( 'sharing-service__content', {
							'is-placeholder': this.props.isFetching,
						} ) }
					>
						<ServiceExamples service={ this.props.service } />

						{ this.isPicasaMigration( connectionStatus ) && <PicasaMigration /> }

						{ ! this.isMailchimpService( connectionStatus ) && (
							<ServiceConnectedAccounts
								connect={ this.connectAnother }
								service={ this.props.service }
							>
								{ connections.map( connection => (
									<Connection
										key={ connection.keyring_connection_ID }
										connection={ connection }
										isDisconnecting={ this.state.isDisconnecting }
										isRefreshing={ this.state.isRefreshing }
										onDisconnect={ this.removeConnection }
										onRefresh={ this.refresh }
										onToggleSitewideConnection={ this.toggleSitewideConnection }
										service={ this.props.service }
										showDisconnect={
											connections.length > 1 ||
											[ 'broken', 'must_reauth' ].includes( connection.status )
										}
									/>
								) ) }
							</ServiceConnectedAccounts>
						) }
						<ServiceTip service={ this.props.service } />
						{ this.isMailchimpService( connectionStatus ) && connectionStatus === 'connected' && (
							<MailchimpSettings keyringConnections={ this.props.keyringConnections } />
						) }
					</div>
				</FoldableCard>
			</li>
		);
	}
}

/**
 * Connect a SharingService component to a Redux store.
 *
 * @param  {Component} sharingService     A SharingService component
 * @param  {Function}  mapStateToProps    Optional. A function to pick props from the state.
 *                                        It should return a plain object, which will be merged into the component's props.
 * @param  {object}    mapDispatchToProps Optional. An object that contains additional action creators. Default: {}
 * @returns {Component} A highter-order service component
 */
export function connectFor( sharingService, mapStateToProps, mapDispatchToProps = {} ) {
	return connect(
		( state, { service } ) => {
			const siteId = getSelectedSiteId( state );
			const userId = getCurrentUserId( state );
			const brokenPublicizeConnections = getBrokenSiteUserConnectionsForService(
				state,
				siteId,
				userId,
				service.ID
			);
			const brokenKeyringConnections = getBrokenKeyringConnectionsByName( state, service.ID );
			const props = {
				availableExternalAccounts: getAvailableExternalAccounts( state, service.ID ),
				brokenConnections: brokenPublicizeConnections.concat( brokenKeyringConnections ),
				isFetching: isFetchingConnections( state, siteId ),
				keyringConnections: getKeyringConnectionsByName( state, service.ID ),
				removableConnections: getRemovableConnections( state, service.ID ),
				path: getCurrentRouteParameterized( state, siteId ),
				service,
				siteId,
				siteUserConnections: getSiteUserConnectionsForService( state, siteId, userId, service.ID ),
				userId,
			};
			return isFunction( mapStateToProps ) ? mapStateToProps( state, props ) : props;
		},
		{
			createSiteConnection,
			deleteSiteConnection,
			successNotice,
			errorNotice,
			failCreateConnection,
			fetchConnection,
			recordGoogleEvent,
			recordTracksEvent,
			requestKeyringConnections,
			updateSiteConnection,
			warningNotice,
			...mapDispatchToProps,
		}
	)( localize( sharingService ) );
}

export default connectFor( SharingService );
