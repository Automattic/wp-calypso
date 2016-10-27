/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { identity, filter, replace, some } from 'lodash';
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
import { errorNotice, successNotice, warningNotice } from 'state/notices/actions';
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
import observe from 'lib/mixins/data-observe';
import PopupMonitor from 'lib/popup-monitor';
import { recordGoogleEvent } from 'state/analytics/actions';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';
import services from './services';
import ServiceAction from './service-action';
import ServiceConnectedAccounts from './service-connected-accounts';
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
		updateSiteConnection: PropTypes.func,
		userId: PropTypes.number,                 // ID of the current user
		warningNotice: PropTypes.func,
	},

	mixins: [ observe( 'connections' ) ],

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
			userId: 0,
			warningNotice: () => {},
		};
	},

	/**
	 * Returns the available connections for the current user.
	 *
	 * @return {Array} Available connections.
	 */
	getConnections: function() {
		return this.filter( 'getConnections', this.props.service.ID, this.props.siteUserConnections, arguments );
	},

	/**
	 * Given a service name, returns the connections for which the current user is permitted to remove.
	 *
	 * @param {string} service The name of the service
	 * @return {Array} Connections for which the current user is permitted to remove
	 */
	getRemovableConnections: function( service ) {
		const connections = this.getConnections().filter( ( connection ) => (
			this.props.site.capabilities && this.props.site.capabilities.edit_others_posts ||
				connection.user_ID === this.props.userId
		), this );

		return this.filter( 'getRemovableConnections', service, connections, arguments );
	},

	/**
	 * Given an array of connection objects which are desired to be destroyed,
	 * returns a filtered set of connection objects to be destroyed. This
	 * enables service-specific handlers to react to destroy events.
	 *
	 * @param {Array|Object} connections A connection or array of connections
	 * @return {Array} Filtered set of connection objects to be destroyed
	 */
	filterConnectionsToRemove: function( connections ) {
		if ( ! Array.isArray( connections ) ) {
			connections = [ connections ];
		}

		return connections.filter( ( connection ) => this.filter( 'filterConnectionToRemove', connection.service, true, arguments ), this );
	},

	/**
	 * Given a service name and optional site ID, returns whether the Keyring
	 * authorization attempt succeeded in creating new Keyring account options.
	 *
	 * @param {string} service The name of the service
	 * @param {int}    siteId  An optional site ID
	 * @return {Boolean} Whether the Keyring authorization attempt succeeded
	 */
	didKeyringConnectionSucceed: function( service, siteId = 0 ) {
		const externalConnections = this.props.availableExternalAccounts,
			isAnyConnectionOptions = some( externalConnections, { isConnected: false } );

		if ( ! externalConnections.length ) {
			// At this point, if there are no available accounts to
			// select, we must assume the user closed the popup
			// before completing the authorization step.
			this.props.connections.emit( 'create:error', { cancel: true } );
		} else if ( ! isAnyConnectionOptions ) {
			// Similarly warn user if all options are connected
			this.props.connections.emit( 'create:error', { connected: true } );
		}

		return this.filter( 'didKeyringConnectionSucceed', service, externalConnections.length && isAnyConnectionOptions, [
			...arguments,
			externalConnections,
			siteId,
		] );
	},

	/**
	 * Passes value through a service-specific handler if one exists, allowing
	 * for service logic to be performed or the value to be modified.
	 *
	 * @param  {string} functionName      A function name to invoke
	 * @param  {string} serviceName       The name of the service
	 * @param  {*}      value             The value returned by original logic
	 * @param  {object} functionArguments An Array-like arguments object
	 * @return {*} The value returned by original logic.
	 */
	filter: function( functionName, serviceName, value, functionArguments ) {
		if ( serviceName in services && services[ serviceName ][ functionName ] ) {
			return services[ serviceName ][ functionName ].apply(
				this, [ value ].concat( Array.prototype.slice.call( functionArguments ) )
			);
		}

		return value;
	},

	getInitialState: function() {
		return {
			isOpen: false,          // The service is visually opened
			isConnecting: false,    // A pending connection is awaiting authorization
			isDisconnecting: false, // A pending disconnection is awaiting completion
			isRefreshing: false,    // A pending refresh is awaiting completion
			isSelectingAccount: false,
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.getConnections().length !== nextProps.siteUserConnections.length ) {
			this.setState( {
				isConnecting: false,
				isDisconnecting: false,
				isSelectingAccount: false,
			} );
		}
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
		const connectionStatus = this.getConnectionStatus( this.props.service.ID );

		// Depending on current status, perform an action when user clicks the
		// service action button
		if ( 'connected' === connectionStatus && this.getRemovableConnections( this.props.service.ID ).length ) {
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

	addConnection: function( service, keyringConnectionId, externalUserId = false ) {
		if ( service ) {
			if ( keyringConnectionId ) {
				// Since we have a Keyring connection to work with, we can immediately
				// create or update the connection
				const keyringConnections = filter( this.props.keyringConnections, { ID: keyringConnectionId } );

				if ( this.props.siteId && externalUserId && keyringConnections.length ) {
					// If a Keyring connection is already in use by another connection,
					// we should trigger an update. There should only be one connection,
					// so we're correct in using the connection ID from the first
					this.props.updateSiteConnection( this.props.siteId, keyringConnections[ 0 ].ID, { external_user_ID: externalUserId } );
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
					this.props.fetchConnections( this.props.siteId );

					// In the case that a Keyring connection doesn't exist, wait for app
					// authorization to occur, then display with the available connections
					if ( this.didKeyringConnectionSucceed( service.ID, this.props.siteId ) && 'publicize' === service.type ) {
						this.setState( { isSelectingAccount: true } );
					}
				} );
			}
		} else {
			// If an account wasn't selected from the dialog or the user cancels
			// the connection, the dialog should simply close
			this.props.warningNotice( this.props.translate( 'The %(service)s connection could not be made because no account was selected.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize connection confirmation',
			} ) );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Cancel Button in Modal', this.props.service.ID );
		}

		// Reset active account selection
		this.setState( { isSelectingAccount: false } );
	},

	toggleSitewideConnection: function( connection, isSitewide ) {
		this.props.connections.update( connection, { shared: isSitewide } );
	},

	refresh: function( oldConnection ) {
		this.setState( { isRefreshing: true } );
		this.props.connections.once( 'refresh:success', this.onRefreshSuccess );
		this.props.connections.once( 'refresh:error', this.onRefreshError );

		if ( ! oldConnection ) {
			// When triggering a refresh from the primary action button, find
			// the first broken connection owned by the current user.
			oldConnection = this.props.siteUserConnections.filter( ( connection ) => ( 'broken' === connection.status ), this );
		}
		this.refreshConnection( oldConnection );
	},

	onConnectionSuccess: function() {
		this.setState( { isConnecting: false } );
		this.props.connections.off( 'create:error', this.onConnectionError );

		this.props.successNotice( this.props.translate( 'The %(service)s account was successfully connected.', {
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
			this.props.warningNotice( this.props.translate(
				'The %(service)s connection could not be made because no account was selected.', {
					args: { service: this.props.service.label },
					context: 'Sharing: Publicize connection confirmation'
				} ) );
		} else if ( reason && reason.connected ) {
			this.props.warningNotice( this.props.translate(
				'The %(service)s connection could not be made because all available accounts are already connected.', {
					args: { service: this.props.service.label },
					context: 'Sharing: Publicize connection confirmation'
				} ) );
		} else {
			this.props.errorNotice( this.props.translate( 'The %(service)s connection could not be made.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize connection confirmation'
			} ) );
		}
	},

	onDisconnectionSuccess: function() {
		this.setState( { isDisconnecting: false } );
		this.props.connections.off( 'destroy:error', this.onDisconnectionError );

		this.props.successNotice( this.props.translate( 'The %(service)s account was successfully disconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize disconnection confirmation'
		} ) );
	},

	onDisconnectionError: function() {
		this.setState( { isDisconnecting: false } );
		this.props.connections.off( 'destroy:success', this.onDisconnectionSuccess );

		this.props.errorNotice( this.props.translate( 'The %(service)s account was unable to be disconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize disconnection confirmation'
		} ) );
	},

	onRefreshSuccess: function() {
		this.setState( { isRefreshing: false } );
		this.props.connections.off( 'refresh:error', this.onRefreshError );

		this.props.successNotice( this.props.translate( 'The %(service)s account was successfully reconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize reconnection confirmation'
		} ) );
	},

	onRefreshError: function() {
		this.setState( { isRefreshing: false } );
		this.props.connections.off( 'refresh:success', this.onRefreshSuccess );

		this.props.errorNotice( this.props.translate( 'The %(service)s account was unable to be reconnected.', {
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
			connections = this.getRemovableConnections( this.props.service.ID );
		}

		this.setState( { isDisconnecting: true } );
		this.props.connections.once( 'destroy:success', this.onDisconnectionSuccess );
		this.props.connections.once( 'destroy:error', this.onDisconnectionError );
		this.removeConnection( connections );
	},

	refreshConnection: function( connection ) {
		this.props.connections.refresh( connection );
	},

	removeConnection: function( connections ) {
		connections = this.filterConnectionsToRemove( connections );
		connections.map( this.props.deleteSiteConnection );
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
		} else if ( ! some( this.getConnections(), { service } ) ) {
			// If no connections exist, the service isn't connected
			status = 'not-connected';
		} else if ( some( this.getConnections(), { status: 'broken' } ) ) {
			// A problematic connection exists
			status = 'reconnect';
		} else {
			// If all else passes, assume service is connected
			status = 'connected';
		}

		return this.filter( 'getConnectionStatus', service, status, arguments );
	},

	render: function() {
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
						numberOfConnections={ this.getConnections().length } />
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
				removableConnections={ this.getRemovableConnections( this.props.service.ID ) } />
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
									onDisconnect={ this.disconnect }
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
			userId,
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
		successNotice,
		updateSiteConnection,
		warningNotice,
	},
)( localize( SharingService ) );
