/**
 * External dependencies
 */
var React = require( 'react' );
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
var ServiceTip = require( './service-tip' ),
	ServiceDescription = require( './service-description' ),
	ServiceExamples = require( './service-examples' ),
	ServiceAction = require( './service-action' ),
	ServiceConnectedAccounts = require( './service-connected-accounts' ),
	notices = require( 'notices' ),
	observe = require( 'lib/mixins/data-observe' ),
	serviceConnections = require( './service-connections' ),
	analytics = require( 'lib/analytics' ),
	FoldableCard = require( 'components/foldable-card' ),
	SocialLogo = require( 'components/social-logo' );

import AccountDialog from './account-dialog';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const SharingService = React.createClass( {
	displayName: 'SharingService',

	propTypes: {
		user: React.PropTypes.object,                    // A user object
		service: React.PropTypes.object.isRequired,      // The single service object
		connections: React.PropTypes.object.isRequired,  // A collections-list instance
		onAddConnection: React.PropTypes.func,           // Handler for creating a new connection for this service
		onRemoveConnection: React.PropTypes.func,        // Handler for removing a connection from this service
		onRefreshConnection: React.PropTypes.func,       // Handler for refreshing a Keyring connection for this service
		onToggleSitewideConnection: React.PropTypes.func,// Handler to invoke when toggling a connection to be shared sitewide
		siteId: React.PropTypes.number,                  // The site ID for which connections are created
	},

	mixins: [ observe( 'connections' ) ],

	getInitialState: function() {
		return {
			isOpen: false,          // The service is visually opened
			isConnecting: false,    // A pending connection is awaiting authorization
			isDisconnecting: false, // A pending disconnection is awaiting completion
			isRefreshing: false,    // A pending refresh is awaiting completion
			selectingAccountForService: null,
		};
	},

	getDefaultProps: function() {
		return {
			onAddConnection: function() {},
			onRemoveConnection: function() {},
			onRefreshConnection: function() {},
			onToggleSitewideConnection: function() {},
			siteId: 0,
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
						this.setState( { selectingAccountForService: service } );
					}
				}.bind( this ) );
			} else {
				analytics.ga.recordEvent( 'Sharing', 'Clicked Connect Button in Modal', this.state.selectingAccountForService.ID );
			}
		} else {
			// If an account wasn't selected from the dialog or the user cancels
			// the connection, the dialog should simply close
			this.props.connections.emit( 'create:error', { cancel: true } );
			analytics.ga.recordEvent( 'Sharing', 'Clicked Cancel Button in Modal', this.state.selectingAccountForService.ID );
		}

		// Reset active account selection
		this.setState( { selectingAccountForService: null } );
	},

	toggleSitewideConnection: function( connection, isSitewide ) {
		this.props.connections.update( connection, { shared: isSitewide } );
	},

	getAccountDialog: function() {
		const isSelectingAccount = !! this.state.selectingAccountForService;
		let accounts;

		if ( isSelectingAccount ) {
			accounts = serviceConnections.getAvailableExternalAccounts( this.state.selectingAccountForService.ID, this.props.siteId );
		}

		return (
			<AccountDialog
				isVisible={ isSelectingAccount }
				service={ this.state.selectingAccountForService }
				accounts={ accounts }
				onAccountSelected={ this.addConnection } />
		);
	},

	onConnectionSuccess: function() {
		this.setState( { isConnecting: false } );
		this.props.connections.off( 'create:error', this.onConnectionError );

		notices.success( this.translate( 'The %(service)s account was successfully connected.', {
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
			notices.warning( this.translate( 'The %(service)s connection could not be made because no account was selected.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize connection confirmation'
			} ) );
		} else if ( reason && reason.connected ) {
			notices.warning( this.translate( 'The %(service)s connection could not be made because all available accounts are already connected.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize connection confirmation'
			} ) );
		} else {
			notices.error( this.translate( 'The %(service)s connection could not be made.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize connection confirmation'
			} ) );
		}
	},

	onDisconnectionSuccess: function() {
		this.setState( { isDisconnecting: false } );
		this.props.connections.off( 'destroy:error', this.onDisconnectionError );

		notices.success( this.translate( 'The %(service)s account was successfully disconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize disconnection confirmation'
		} ) );
	},

	onDisconnectionError: function() {
		this.setState( { isDisconnecting: false } );
		this.props.connections.off( 'destroy:success', this.onDisconnectionSuccess );

		notices.error( this.translate( 'The %(service)s account was unable to be disconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize disconnection confirmation'
		} ) );
	},

	onRefreshSuccess: function() {
		this.setState( { isRefreshing: false } );
		this.props.connections.off( 'refresh:error', this.onRefreshError );

		notices.success( this.translate( 'The %(service)s account was successfully reconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize reconnection confirmation'
		} ) );
	},

	onRefreshError: function() {
		this.setState( { isRefreshing: false } );
		this.props.connections.off( 'refresh:success', this.onRefreshSuccess );

		notices.error( this.translate( 'The %(service)s account was unable to be reconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize reconnection confirmation'
		} ) );
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

	performAction: function() {
		const connectionStatus = serviceConnections.getConnectionStatus( this.props.service.ID );

		// Depending on current status, perform an action when user clicks the
		// service action button
		if ( 'connected' === connectionStatus && serviceConnections.getRemovableConnections( this.props.service.ID ).length ) {
			this.disconnect();
			analytics.ga.recordEvent( 'Sharing', 'Clicked Disconnect Button', this.props.service.ID );
		} else if ( 'reconnect' === connectionStatus ) {
			this.refresh();
			analytics.ga.recordEvent( 'Sharing', 'Clicked Reconnect Button', this.props.service.ID );
		} else {
			this.connect();
			analytics.ga.recordEvent( 'Sharing', 'Clicked Connect Button', this.props.service.ID );
		}
	},

	render: function() {
		const connectionStatus = serviceConnections.getConnectionStatus( this.props.service.ID ),
			connections = serviceConnections.getConnections( this.props.service.ID ),
			elementClass = [
				'sharing-service',
				this.props.service.ID,
				connectionStatus,
				this.state.isOpen ? 'is-open' : ''
			].join( ' ' ),
			iconsMap = {
				Facebook: 'facebook',
				Twitter: 'twitter',
				'Google+': 'google-plus',
				LinkedIn: 'linkedin',
				Tumblr: 'tumblr',
				Path: 'path',
				Eventbrite: 'eventbrite'
			};

		const header = (
			<div>
				<SocialLogo
					icon={ iconsMap[ this.props.service.label ] }
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

		const content = (
			<div
				className={ 'sharing-service__content ' + ( serviceConnections.isFetchingAccounts() ? 'is-placeholder' : '' ) }>
				{ this.getAccountDialog() }
				<ServiceExamples service={ this.props.service } />
				<ServiceConnectedAccounts
					connections={ connections }
					isDisconnecting={ this.state.isDisconnecting }
					isRefreshing={ this.state.isRefreshing }
					onAddConnection={ this.connect }
					onRefreshConnection={ this.refresh }
					onRemoveConnection={ this.disconnect }
					onToggleSitewideConnection={ this.toggleSitewideConnection }
					service={ this.props.service } />
				<ServiceTip service={ this.props.service } />
			</div> );

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
			<FoldableCard
				className={ elementClass }
				header={ header }
				clickableHeader
				compact
				summary={ action }
				expandedSummary={ action } >
				{ content }
			</FoldableCard>
		);
	}
} );

export default connect(
	( state ) => ( {
		siteId: getSelectedSiteId( state ),
		user: getCurrentUser( state ),
	} ),
)( SharingService );
