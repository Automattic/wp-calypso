/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import ServiceAction from './service-action';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';
import {
	getKeyringConnections,
	isKeyringConnectionsFetching,
} from 'state/sharing/keyring/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import requestExternalAccess from 'lib/sharing';

export const getNamedConnectedService = ( state, name ) =>
	getKeyringConnections( state ).filter( ( item ) => item.service === name );

const STATUS_UNKNOWN = 'unknown';
const STATUS_NOT_CONNECTED = 'not-connected';
const STATUS_RECONNECT = 'reconnect';
const STATUS_CONNECTED = 'connected';

class InlineConnectButton extends Component {
	static propTypes = {
		service: PropTypes.object.isRequired,
		isFetching: PropTypes.bool.isRequired,
		connectedService: PropTypes.object,
	};

	constructor( props ) {
		super( props );

		this.handleAction = this.onAction.bind( this );
		this.state = {
			isConnecting: false,
			isRefreshing: false,
		};
	}

	getConnectionStatus( service, isFetching ) {
		if ( isFetching ) {
			return STATUS_UNKNOWN;
		}

		if ( ! service ) {
			return STATUS_NOT_CONNECTED;
		}

		if ( service.status === 'broken' ) {
			return STATUS_RECONNECT;
		}

		return STATUS_CONNECTED;
	}

	onAction() {
		const { service } = this.props;
		const connectionStatus = this.getConnectionStatus(
			this.props.connectedService,
			this.state.isFetching
		);

		if ( STATUS_RECONNECT === connectionStatus ) {
			this.refresh( service );
		} else {
			this.addConnection( service );
		}
	}

	refresh( service ) {
		this.setState( { isRefreshing: true } );
		this.requestAccess( service.refresh_URL );
		this.trackEvent( service.ID, 'Clicked Connect Button' );
	}

	addConnection( service ) {
		this.setState( { isConnecting: true } );
		this.requestAccess( service.connect_URL );
		this.trackEvent( service.ID, 'Clicked Reconnect Button' );
	}

	requestAccess( url ) {
		requestExternalAccess( url, () => {
			this.props.requestKeyringConnections();
		} );
	}

	trackEvent( id, eventName ) {
		this.props.recordGoogleEvent( 'Sharing', eventName, id );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.isFetching === true ) {
			this.setState( { isConnecting: false, isRefreshing: false } );
		}
	}

	render() {
		const connectionStatus = this.getConnectionStatus(
			this.props.connectedService,
			this.props.isFetching
		);
		const { isConnecting, isRefreshing } = this.state;
		const { service } = this.props;

		return (
			<ServiceAction
				status={ connectionStatus }
				service={ service }
				onAction={ this.handleAction }
				isConnecting={ isConnecting }
				isRefreshing={ isRefreshing }
				isDisconnecting={ false }
			/>
		);
	}
}

export default connect(
	( state, props ) => {
		const named = getNamedConnectedService( state, props.serviceName );

		return {
			isFetching: isKeyringConnectionsFetching( state ),
			connectedService: named.length > 0 ? named[ 0 ] : null,
		};
	},
	{
		requestKeyringConnections,
		recordGoogleEvent,
	}
)( InlineConnectButton );
