/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { identity, replace, some } from 'lodash';
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
import notices from 'notices';
import observe from 'lib/mixins/data-observe';
import { recordGoogleEvent } from 'state/analytics/actions';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';
import ServiceAction from './service-action';
import ServiceConnectedAccounts from './service-connected-accounts';
import serviceConnections from './service-connections';
import ServiceDescription from './service-description';
import ServiceExamples from './service-examples';
import ServiceTip from './service-tip';

const SharingService = React.createClass( {
	displayName: 'SharingService',

	propTypes: {
		availableExternalAccounts: PropTypes.arrayOf( PropTypes.object ),
		brokenConnections: PropTypes.arrayOf( PropTypes.object ),
		connections: PropTypes.object.isRequired,   // A collections-list instance
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
	},

	mixins: [ observe( 'connections' ) ],

	getInitialState: function() {
		return {
			isOpen: false,          // The service is visually opened
			isConnecting: false,    // A pending connection is awaiting authorization
			isDisconnecting: false, // A pending disconnection is awaiting completion
			isRefreshing: false,    // A pending refresh is awaiting completion
			isSelectingAccount: false,
		};
	},

	getDefaultProps: function() {
		return {
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
			site: Object.freeze( {} ),
			siteId: 0,
			siteUserConnections: [],
			translate: identity,
			updateSiteConnection: () => {},
		};
	},

	componentWillUnmount: function() {
		this.props.connections.off( 'create:success', this.onConnectionSuccess );
		this.props.connections.off( 'create:error', this.onConnectionError );
		this.props.connections.off( 'destroy:success', this.onDisconnectionSuccess );
		this.props.connections.off( 'destroy:error', this.onDisconnectionError );
		this.props.connections.off( 'refresh:success', this.onRefreshSuccess );
		this.props.connections.off( 'refresh:error', this.onRefreshError );
	},

	performAction: function() {
		const connectionStatus = serviceConnections.getConnectionStatus( this.props.service.ID );

		// Depending on current status, perform an action when user clicks the
		// service action button
		if ( 'connected' === connectionStatus && serviceConnections.getRemovableConnections( this.props.service.ID ).length ) {
			this.disconnect();
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Disconnect Button', this.props.service.ID );
		} else if ( 'reconnect' === connectionStatus ) {
			this.refresh();
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Reconnect Button', this.props.service.ID );
		} else {
			this.connect();
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Connect Button', this.props.service.ID );
		}
	},

	addConnection: function( service, keyringConnectionId, externalUserId ) {
		if ( service ) {
			// Attempt to create a new connection. If a Keyring connection ID
			// is not provided, the user will need to authorize the app
			this.props.connections.create( service, this.props.siteId, keyringConnectionId, externalUserId );

			// In the case that a Keyring connection doesn't exist, wait for app
			// authorization to occur, then display with the available connections
			if ( ! keyringConnectionId ) {
				this.props.connections.once( 'connect', function() {
					if ( serviceConnections.didKeyringConnectionSucceed( service.ID, this.props.siteId ) &&
						serviceConnections.isServiceForPublicize( service.ID ) ) {
						this.setState( { isSelectingAccount: true } );
					}
				}.bind( this ) );
			} else {
				this.props.recordGoogleEvent( 'Sharing', 'Clicked Connect Button in Modal', this.props.service.ID );
			}
		} else {
			// If an account wasn't selected from the dialog or the user cancels
			// the connection, the dialog should simply close
			this.props.connections.emit( 'create:error', { cancel: true } );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Cancel Button in Modal', this.props.service.ID );
		}

		// Reset active account selection
		this.setState( { isSelectingAccount: null } );
	},

	toggleSitewideConnection: function( connection, isSitewide ) {
		this.props.connections.update( connection, { shared: isSitewide } );
	},

	refresh: function( connection ) {
		this.setState( { isRefreshing: true } );
		this.props.connections.once( 'refresh:success', this.onRefreshSuccess );
		this.props.connections.once( 'refresh:error', this.onRefreshError );

		if ( ! connection ) {
			// When triggering a refresh from the primary action button, find
			// the first broken connection owned by the current user.
			connection = serviceConnections.getRefreshableConnections( this.props.service.ID )[ 0 ];
		}
		this.props.connections.refresh( connection );
	},

	onConnectionSuccess: function() {
		this.setState( { isConnecting: false } );
		this.props.connections.off( 'create:error', this.onConnectionError );

		notices.success( this.props.translate( 'The %(service)s account was successfully connected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize connection confirmation'
		} ) );

		if ( ! this.state.isOpen ) {
			this.setState( { isOpen: true } );
		}
	},

	onConnectionError: function( reason ) {
		this.setState( { isConnecting: false } );
		this.props.connections.off( 'create:success', this.onConnectionSuccess );

		if ( reason && reason.cancel ) {
			notices.warning( this.props.translate( 'The %(service)s connection could not be made because no account was selected.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize connection confirmation'
			} ) );
		} else if ( reason && reason.connected ) {
			notices.warning( this.props.translate(
				'The %(service)s connection could not be made because all available accounts are already connected.', {
					args: { service: this.props.service.label },
					context: 'Sharing: Publicize connection confirmation'
				} ) );
		} else {
			notices.error( this.props.translate( 'The %(service)s connection could not be made.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize connection confirmation'
			} ) );
		}
	},

	onDisconnectionSuccess: function() {
		this.setState( { isDisconnecting: false } );
		this.props.connections.off( 'destroy:error', this.onDisconnectionError );

		notices.success( this.props.translate( 'The %(service)s account was successfully disconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize disconnection confirmation'
		} ) );
	},

	onDisconnectionError: function() {
		this.setState( { isDisconnecting: false } );
		this.props.connections.off( 'destroy:success', this.onDisconnectionSuccess );

		notices.error( this.props.translate( 'The %(service)s account was unable to be disconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize disconnection confirmation'
		} ) );
	},

	onRefreshSuccess: function() {
		this.setState( { isRefreshing: false } );
		this.props.connections.off( 'refresh:error', this.onRefreshError );

		notices.success( this.props.translate( 'The %(service)s account was successfully reconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize reconnection confirmation'
		} ) );
	},

	onRefreshError: function() {
		this.setState( { isRefreshing: false } );
		this.props.connections.off( 'refresh:success', this.onRefreshSuccess );

		notices.error( this.props.translate( 'The %(service)s account was unable to be reconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize reconnection confirmation'
		} ) );
	},

	connectAnother() {
		this.props.recordGoogleEvent( 'Sharing', 'Clicked Connect Another Account Button', this.props.service.ID );
		this.connect();
	},

	connect: function() {
		this.setState( { isConnecting: true } );
		this.props.connections.once( 'create:success', this.onConnectionSuccess );
		this.props.connections.once( 'create:error', this.onConnectionError );
		this.addConnection( this.props.service );
	},

	disconnect: function( connections ) {
		if ( 'undefined' === typeof connections ) {
			// If connections is undefined, assume that all connections for
			// this service are to be removed.
			connections = serviceConnections.getRemovableConnections( this.props.service.ID );
		}

		this.setState( { isDisconnecting: true } );
		this.props.connections.once( 'destroy:success', this.onDisconnectionSuccess );
		this.props.connections.once( 'destroy:error', this.onDisconnectionError );

		connections = serviceConnections.filterConnectionsToRemove( connections );
		this.props.connections.destroy( connections );
	},

	/**
	 * Given a service name and optional site ID, returns the current status of the
	 * service's connection.
	 *
	 * @param {string} service The name of the service to check
	 * @return {string} Connection status.
	 */
	getConnectionStatus: function( service ) {
		let status;

		if ( this.props.isFetching ) {
			// When connections are still loading, we don't know the status
			status = 'unknown';
		} else if ( ! some( this.props.siteConnections, { service } ) ) {
			// If no connections exist, the service isn't connected
			status = 'not-connected';
		} else if ( some( this.props.siteConnections, { status: 'broken', keyring_connection_user_ID: this.props.user.ID } ) ) {
			// A problematic connection exists
			status = 'reconnect';
		} else {
			// If all else passes, assume service is connected
			status = 'connected';
		}

		return status;
	},

	render: function() {
		const connectionStatus = serviceConnections.getConnectionStatus( this.props.service.ID ),
			connections = serviceConnections.getConnections( this.props.service.ID );
		const classNames = classnames( 'sharing-service', this.props.service.ID, connectionStatus, {
			'is-open': this.state.isOpen,
		} );
		const accounts = this.state.isSelectingAccount
			? serviceConnections.getAvailableExternalAccounts( this.props.service.ID, this.props.siteId )
			: [];

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
						numberOfConnections={ connections.length } />
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
				isDisconnecting={ this.state.isDisconnecting }
				removableConnections={ serviceConnections.getRemovableConnections( this.props.service.ID ) } />
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
					<div className={ classnames( 'sharing-service__content', { 'is-placeholder': serviceConnections.isFetchingAccounts() } ) }>
						<ServiceExamples service={ this.props.service } />
						<ServiceConnectedAccounts connect={ this.connectAnother } service={ this.props.service }>
							{ connections.map( ( connection ) =>
								<Connection
									key={ connection.keyring_connection_ID }
									connection={ connection }
									isDisconnecting={ this.state.isDisconnecting }
									isRefreshing={ this.state.isRefreshing }
									onDisconnect={ this.disconnect }
									onRefresh={ this.refresh }
									onToggleSitewideConnection={ this.toggleSitewideConnection }
									service={ this.props.service }
									showDisconnect={ connections.length > 1 || 'broken' === connection.status } />
							) }
						</ServiceConnectedAccounts>
						<ServiceTip service={ this.props.service } />
					</div>
				</FoldableCard>
			</li>
		);
	}
} );

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
