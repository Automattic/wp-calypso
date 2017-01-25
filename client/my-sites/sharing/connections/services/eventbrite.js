/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { identity, last, replace, some } from 'lodash';
import { localize } from 'i18n-calypso';
import SocialLogo from 'social-logos';

/**
 * Internal dependencies
 */
import Connection from '../connection';
import { deleteKeyringConnection } from 'state/sharing/keyring/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { failCreateConnection } from 'state/sharing/publicize/actions';
import FoldableCard from 'components/foldable-card';
import { getAvailableExternalAccounts } from 'state/sharing/selectors';
import { getKeyringConnectionsByName, isKeyringConnectionsFetching } from 'state/sharing/keyring/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import PopupMonitor from 'lib/popup-monitor';
import { recordGoogleEvent } from 'state/analytics/actions';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';
import { saveSiteSettings } from 'state/site-settings/actions';
import ServiceAction from '../service-action';
import ServiceConnectedAccounts from '../service-connected-accounts';
import ServiceDescription from '../service-description';
import ServiceExamples from '../service-examples';
import ServiceTip from '../service-tip';

class Eventbrite extends Component {
	static propTypes = {
		availableExternalAccounts: PropTypes.arrayOf( PropTypes.object ),
		errorNotice: PropTypes.func,
		failCreateConnection: PropTypes.func,
		isFetching: PropTypes.bool,
		keyringConnections: PropTypes.arrayOf( PropTypes.object ),
		recordGoogleEvent: PropTypes.func,
		requestKeyringConnections: PropTypes.func,
		service: PropTypes.object.isRequired,     // The single service object
		siteId: PropTypes.number,                 // The site ID for which connections are created
		translate: PropTypes.func,
	};

	static defaultProps = {
		availableExternalAccounts: [],
		errorNotice: () => {},
		failCreateConnection: () => {},
		isFetching: false,
		keyringConnections: [],
		recordGoogleEvent: () => {},
		requestKeyringConnections: () => {},
		site: Object.freeze( {} ),
		siteId: 0,
		translate: identity,
	};

	/**
	 * Triggers an action based on the current connection status.
	 */
	performAction = () => {
		const connectionStatus = this.getConnectionStatus( this.props.service.ID );

		// Depending on current status, perform an action when user clicks the
		// service action button
		if ( 'connected' === connectionStatus && this.props.keyringConnections.length ) {
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
	 */
	addConnection = ( service, keyringConnectionId ) => {
		this.setState( { isConnecting: true } );

		if ( service ) {
			if ( keyringConnectionId ) {
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
			this.props.errorNotice( this.props.translate( 'The %(service)s connection could not be made because no account was selected.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize connection confirmation',
			} ) );
			this.setState( { isConnecting: false } );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Cancel Button in Modal', this.props.service.ID );
		}
	};

	/**
	 * Lets users re-authenticate their Keyring connections if lost.
	 */
	refresh = () => {
		this.setState( { isRefreshing: true } );

		this.props.keyringConnections.map( ( connection ) => {
			if ( connection ) {
				// Attempt to create a new connection. If a Keyring connection ID
				// is not provided, the user will need to authorize the app
				const popupMonitor = new PopupMonitor();

				popupMonitor.open( connection.refresh_URL, null, 'toolbar=0,location=0,status=0,menubar=0,' +
					popupMonitor.getScreenCenterSpecs( 780, 500 ) );

				popupMonitor.once( 'close', () => {
					// When the user has finished authorizing the connection
					// (or otherwise closed the window), force a refresh
					this.props.requestKeyringConnections();
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
	 * Deletes the Keyring connections.
	 */
	removeConnection = () => {
		this.setState( { isDisconnecting: true } );
		this.props.saveSiteSettings( this.props.siteId, { eventbrite_api_token: null } );
		this.props.deleteKeyringConnection( last( this.props.keyringConnections ) );
	};

	constructor() {
		super( ...arguments );

		this.state = {
			isOpen: false,               // The service is visually opened
			isConnecting: false,         // A pending connection is awaiting authorization
			isDisconnecting: false,      // A pending disconnection is awaiting completion
			isRefreshing: false,         // A pending refresh is awaiting completion
			isPendingConnections: false, // Waiting for Keyring Connections request to finish
		};
	}

	componentWillReceiveProps( { availableExternalAccounts } ) {
		if ( this.props.availableExternalAccounts.length !== availableExternalAccounts.length ) {
			this.setState( {
				isConnecting: false,
				isDisconnecting: false,
			} );
		}

		if ( this.state.isAwaitingConnections ) {
			this.setState( {
				isAwaitingConnections: false,
				isRefreshing: false,
			} );

			if ( this.didKeyringConnectionSucceed( availableExternalAccounts ) ) {
				this.setState( { isConnecting: false } );
				this.props.successNotice( this.props.translate( 'The %(service)s account was successfully connected.', {
					args: { service: this.props.service.label },
					context: 'Sharing: Publicize connection confirmation'
				} ) );
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
		} else if ( ! some( this.props.keyringConnections, { service } ) ) {
			// If no connections exist, the service isn't connected
			status = 'not-connected';
		} else if ( some( this.props.keyringConnections, { status: 'broken' } ) ) {
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
		} else {
			this.props.saveSiteSettings( this.props.siteId, { eventbrite_api_token: last( externalAccounts ).keyringConnectionId } );
		}

		return externalAccounts.length && hasAnyConnectionOptions;
	}

	render() {
		const connectionStatus = this.getConnectionStatus( this.props.service.ID );
		const classNames = classnames( 'sharing-service', this.props.service.ID, connectionStatus, {
			'is-open': this.state.isOpen,
		} );

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
						numberOfConnections={ this.props.keyringConnections.length } />
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
				<FoldableCard
					className={ classNames }
					header={ header }
					clickableHeader
					compact
					summary={ action }
					expandedSummary={ action }
				>
					<div className={ 'sharing-service__content ' + ( this.props.isFetching ? 'is-placeholder' : '' ) }>
						<ServiceExamples service={ this.props.service } />
						<ServiceConnectedAccounts connect={ this.addConnection } service={ this.props.service }>
							{ this.props.keyringConnections.map( ( connection ) =>
								<Connection
									key={ connection.ID }
									connection={ connection }
									isDisconnecting={ this.state.isDisconnecting }
									isRefreshing={ this.state.isRefreshing }
									onDisconnect={ this.removeConnection }
									onRefresh={ this.refresh }
									onToggleSitewideConnection={ () => {} }
									service={ this.props.service } />
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
	( state ) => ( {
		availableExternalAccounts: getAvailableExternalAccounts( state, 'eventbrite' ),
		isFetching: isKeyringConnectionsFetching( state ),
		keyringConnections: getKeyringConnectionsByName( state, 'eventbrite' ),
		siteId: getSelectedSiteId( state ),
	} ),
	{
		errorNotice,
		failCreateConnection,
		recordGoogleEvent,
		requestKeyringConnections,
		deleteKeyringConnection,
		saveSiteSettings,
		successNotice,
	},
)( localize( Eventbrite ) );
