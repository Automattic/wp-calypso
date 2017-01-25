/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { identity, find, replace, some } from 'lodash';
import { localize } from 'i18n-calypso';
import SocialLogo from 'social-logos';

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
import { errorNotice } from 'state/notices/actions';
import Connection from './connection';
import FoldableCard from 'components/foldable-card';
import { getAvailableExternalAccounts } from 'state/sharing/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getKeyringConnectionsByName } from 'state/sharing/keyring/selectors';
import {
	getBrokenSiteUserConnectionsForService,
	getRemovableConnections,
	getSiteUserConnectionsForService,
	isFetchingConnections,
} from 'state/sharing/publicize/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import PopupMonitor from 'lib/popup-monitor';
import { recordGoogleEvent } from 'state/analytics/actions';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';
import ServiceAction from './service-action';
import ServiceConnectedAccounts from './service-connected-accounts';
import ServiceDescription from './service-description';
import ServiceExamples from './service-examples';
import ServiceTip from './service-tip';

class SharingService extends Component {
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
		removableConnections: PropTypes.arrayOf( PropTypes.object ),
		requestKeyringConnections: PropTypes.func,
		service: PropTypes.object.isRequired,       // The single service object
		siteId: PropTypes.number,                   // The site ID for which connections are created
		siteUserConnections: PropTypes.arrayOf( PropTypes.object ),
		translate: PropTypes.func,
		updateSiteConnection: PropTypes.func,
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
	};

	/**
	 * Triggers an action based on the current connection status.
	 */
	performAction = () => {
		const connectionStatus = this.getConnectionStatus( this.props.service.ID );

		// Depending on current status, perform an action when user clicks the
		// service action button
		if ( 'connected' === connectionStatus && this.props.removableConnections.length ) {
			this.removeConnection();
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Disconnect Button', this.props.service.ID );
		} else if ( 'reconnect' === connectionStatus ) {
			this.refresh();
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Reconnect Button', this.props.service.ID );
		} else {
			this.addConnection( this.props.service );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Connect Button', this.props.service.ID );
		}
	};

	/**
	 * Establishes a new connection.
	 *
	 * @param {Object} service             Service to connect to.
	 * @param {Number} keyringConnectionId Keyring conneciton ID.
	 * @param {Number} externalUserId      Optional. User ID for the service. Default: 0.
	 */
	addConnection = ( service, keyringConnectionId, externalUserId = 0 ) => {
		this.setState( { isConnecting: true } );

		if ( service ) {
			if ( keyringConnectionId ) {
				// Since we have a Keyring connection to work with, we can immediately
				// create or update the connection
				const existingConnection = find( this.props.siteUserConnections, { keyring_connection_ID: keyringConnectionId } );

				if ( this.props.siteId && existingConnection ) {
					// If a Keyring connection is already in use by another connection,
					// we should trigger an update. There should only be one connection,
					// so we're correct in using the connection ID from the first
					this.props.updateSiteConnection( existingConnection, { external_user_ID: externalUserId } );
				} else {
					this.props.createSiteConnection( this.props.siteId, keyringConnectionId, externalUserId );
				}

				this.props.recordGoogleEvent( 'Sharing', 'Clicked Connect Button in Modal', this.props.service.ID );
			} else {
				// Attempt to create a new connection. If a Keyring connection ID
				// is not provided, the user will need to authorize the app
				const popupMonitor = new PopupMonitor();

				popupMonitor.open( service.connect_URL, null, 'toolbar=0,location=0,status=0,menubar=0,' +
					popupMonitor.getScreenCenterSpecs( 780, 500 ) );

				popupMonitor.once( 'close', () => {
					// When the user has finished authorizing the connection
					// (or otherwise closed the window), force a refresh
					this.props.requestKeyringConnections();

					// In the case that a Keyring connection doesn't exist, wait for app
					// authorization to occur, then display with the available connections
					this.setState( { isAwaitingConnections: true } );
				} );
			}
		} else {
			// If an account wasn't selected from the dialog or the user cancels
			// the connection, the dialog should simply close
			this.props.errorNotice( this.props.translate( 'The connection could not be made because no account was selected.', {
				context: 'Sharing: Publicize connection confirmation'
			} ) );
			this.setState( { isConnecting: false } );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Cancel Button in Modal', this.props.service.ID );
		}

		// Reset active account selection
		this.setState( { isSelectingAccount: false } );
	};

	connectAnother = () => {
		this.props.recordGoogleEvent( 'Sharing', 'Clicked Connect Another Account Button', this.props.service.ID );
		this.addConnection( this.props.service );
	};

	/**
	 * Sets a connection to be site-wide or not.
	 *
	 * @param  {Object}   connection Connection to update.
	 * @param  {Boolean}  shared     Whether the connection can be used by other users.
	 * @return {Function}            Action thunk
	 */
	toggleSitewideConnection = ( connection, shared ) => this.props.updateSiteConnection( connection, { shared } );

	/**
	 * Lets users re-authenticate their Keyring connections if lost.
	 *
	 * @param {Array} connections Optional. Broken connections.
	 *                            Default: All broken connections for this service.
	 */
	refresh = ( connections = this.props.brokenConnections ) => {
		this.setState( { isRefreshing: true } );

		connections.map( ( connection ) => {
			const keyringConnection = find( this.props.keyringConnections, { ID: connection.keyring_connection_ID } );

			if ( keyringConnection ) {
				// Attempt to create a new connection. If a Keyring connection ID
				// is not provided, the user will need to authorize the app
				const popupMonitor = new PopupMonitor();

				popupMonitor.open( connection.refresh_URL, null, 'toolbar=0,location=0,status=0,menubar=0,' +
					popupMonitor.getScreenCenterSpecs( 780, 500 ) );

				popupMonitor.once( 'close', () => {
					// When the user has finished authorizing the connection
					// (or otherwise closed the window), force a refresh
					this.props.fetchConnection( this.props.siteId, connection.ID );
				} );
			} else {
				this.props.errorNotice( this.props.translate( 'The %(service)s account was unable to be reconnected.', {
					args: { service: this.props.service.label },
					context: 'Sharing: Publicize reconnection confirmation'
				} ) );
			}
		} );
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
			isOpen: false,                // The service is visually opened
			isConnecting: false,          // A pending connection is awaiting authorization
			isDisconnecting: false,       // A pending disconnection is awaiting completion
			isRefreshing: false,          // A pending refresh is awaiting completion
			isSelectingAccount: false,    // The modal to select an account is open
			isAwaitingConnections: false, // Waiting for Keyring Connections request to finish
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteUserConnections.length !== nextProps.siteUserConnections.length ) {
			this.setState( {
				isConnecting: false,
				isDisconnecting: false,
				isSelectingAccount: false,
			} );
		}

		if ( this.props.brokenConnections.length !== nextProps.brokenConnections.length ) {
			this.setState( { isRefreshing: false } );
		}

		if ( this.state.isAwaitingConnections ) {
			this.setState( { isAwaitingConnections: false } );

			if ( this.didKeyringConnectionSucceed( nextProps.availableExternalAccounts ) ) {
				this.setState( { isSelectingAccount: true } );
			}
		}
	}

	/**
	 * Given a service name and optional site ID, returns the current status of the
	 * service's connection.
	 *
	 * @param {string} service The name of the service to check
	 * @return {string} Connection status.
	 */
	getConnectionStatus( service ) {
		let status;

		if ( this.props.isFetching ) {
			// When connections are still loading, we don't know the status
			status = 'unknown';
		} else if ( ! some( this.props.siteUserConnections, { service } ) ) {
			// If no connections exist, the service isn't connected
			status = 'not-connected';
		} else if ( some( this.props.siteUserConnections, { status: 'broken' } ) ) {
			// A problematic connection exists
			status = 'reconnect';
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
	 * @return {Boolean} Whether the Keyring authorization attempt succeeded
	 */
	didKeyringConnectionSucceed( externalAccounts ) {
		const hasAnyConnectionOptions = some( externalAccounts, { isConnected: false } );

		if ( ! externalAccounts.length ) {
			// At this point, if there are no available accounts to
			// select, we must assume the user closed the popup
			// before completing the authorization step.
			this.props.failCreateConnection( {
				message: this.props.translate( 'The %(service)s connection could not be made because no account was selected.', {
					args: { service: this.props.service.label },
					context: 'Sharing: Publicize connection confirmation',
				} ),
			} );
			this.setState( { isConnecting: false } );
		} else if ( ! hasAnyConnectionOptions ) {
			// Similarly warn user if all options are connected
			this.props.failCreateConnection( {
				message: this.props.translate( 'The %(service)s connection could not be made because all available accounts are already connected.', {
					args: { service: this.props.service.label },
					context: 'Sharing: Publicize connection confirmation',
				} )
			} );
			this.setState( { isConnecting: false } );
		}

		return externalAccounts.length && hasAnyConnectionOptions;
	}

	render() {
		const connectionStatus = this.getConnectionStatus( this.props.service.ID );
		const classNames = classnames( 'sharing-service', this.props.service.ID, connectionStatus, {
			'is-open': this.state.isOpen,
		} );
		const accounts = this.state.isSelectingAccount ? this.props.availableExternalAccounts : [];

		const header = (
			<div>
				<SocialLogo
					icon={ replace( this.props.service.ID, '_', '-' ) }
					size={ 48 }
					className="sharing-service__logo" />

				<div className="sharing-service__name">
					<h2>{ this.props.service.label }</h2>
					<ServiceDescription
						service={ this.props.service }
						status={ connectionStatus }
						numberOfConnections={ this.props.siteUserConnections.length } />
				</div>
			</div>
		);

		const action = (
			<ServiceAction
				status={ connectionStatus }
				service={ this.props.service }
				onAction={ this.performAction }
				isConnecting={ this.state.isConnecting }
				isRefreshing={ this.state.isRefreshing }
				isDisconnecting={ this.state.isDisconnecting } />
		);

		return (
			<li>
				<AccountDialog
					isVisible={ this.state.isSelectingAccount }
					service={ this.props.service }
					accounts={ accounts }
					onAccountSelected={ this.addConnection } />
				<FoldableCard
					className={ classNames }
					header={ header }
					clickableHeader
					compact
					summary={ action }
					expandedSummary={ action } >
					<div className={ classnames( 'sharing-service__content', { 'is-placeholder': this.props.isFetching } ) }>
						<ServiceExamples service={ this.props.service } />
						<ServiceConnectedAccounts connect={ this.connectAnother } service={ this.props.service }>
							{ this.props.siteUserConnections.map( ( connection ) =>
								<Connection
									key={ connection.keyring_connection_ID }
									connection={ connection }
									isDisconnecting={ this.state.isDisconnecting }
									isRefreshing={ this.state.isRefreshing }
									onDisconnect={ this.removeConnection }
									onRefresh={ this.refresh }
									onToggleSitewideConnection={ this.toggleSitewideConnection }
									service={ this.props.service }
									showDisconnect={ this.props.siteUserConnections.length > 1 || 'broken' === connection.status } />
							) }
						</ServiceConnectedAccounts>
						<ServiceTip service={ this.props.service } />
					</div>
				</FoldableCard>
			</li>
		);
	}
}

export default connect(
	( state, { service } ) => {
		const siteId = getSelectedSiteId( state );
		const userId = getCurrentUserId( state );

		return {
			availableExternalAccounts: getAvailableExternalAccounts( state, service.ID ),
			brokenConnections: getBrokenSiteUserConnectionsForService( state, siteId, userId, service.ID ),
			isFetching: isFetchingConnections( state, siteId ),
			keyringConnections: getKeyringConnectionsByName( state, service.ID ),
			removableConnections: getRemovableConnections( state, service.ID ),
			siteId,
			siteUserConnections: getSiteUserConnectionsForService( state, siteId, userId, service.ID ),
		};
	},
	{
		createSiteConnection,
		deleteSiteConnection,
		errorNotice,
		failCreateConnection,
		fetchConnection,
		recordGoogleEvent,
		requestKeyringConnections,
		updateSiteConnection,
	},
)( localize( SharingService ) );
