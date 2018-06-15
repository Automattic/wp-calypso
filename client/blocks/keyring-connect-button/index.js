/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { differenceBy, find, isEqual, last, noop, some } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import {
	deleteStoredKeyringConnection,
	requestKeyringConnections,
} from 'state/sharing/keyring/actions';
import { getKeyringServiceByName } from 'state/sharing/services/selectors';
import QueryKeyringServices from 'components/data/query-keyring-services';
import requestExternalAccess from 'lib/sharing';
import {
	getKeyringConnectionsByName,
	isKeyringConnectionsFetching,
} from 'state/sharing/keyring/selectors';

class KeyringConnectButton extends Component {
	static propTypes = {
		service: PropTypes.oneOfType( [
			PropTypes.shape( {
				ID: PropTypes.string.isRequired,
				connect_URL: PropTypes.string.isRequired,
			} ),
			PropTypes.bool,
		] ),
		isFetching: PropTypes.bool,
		keyringConnections: PropTypes.array,
		onClick: PropTypes.func,
		onConnect: PropTypes.func,
		forceReconnect: PropTypes.bool,
		primary: PropTypes.bool,
	};

	static defaultProps = {
		onClick: noop,
		onConnect: noop,
		forceReconnect: false,
		primary: false,
	};

	state = {
		isOpen: false, // The service is visually opened
		isConnecting: false, // A pending connection is awaiting authorization
		isRefreshing: false, // A pending refresh is awaiting completion
		isAwaitingConnections: false, // Waiting for Keyring Connections request to finish
	};

	onClick = () => {
		this.props.onClick();
		this.performAction();
	};

	/**
	 * Returns the current status of the service's connection.
	 *
	 * @return {string} Connection status.
	 */
	getConnectionStatus() {
		if ( this.props.isFetching ) {
			// When connections are still loading, we don't know the status
			return 'unknown';
		}

		// keyringConnections are already filtered for this.props.service.ID
		if ( this.props.keyringConnections.length === 0 ) {
			// If no connections exist, the service isn't connected
			return 'not-connected';
		}

		if ( some( this.props.keyringConnections, { status: 'broken' } ) ) {
			// A problematic connection exists
			return 'reconnect';
		}

		// If all else passes, assume service is connected
		return 'connected';
	}

	performAction = () => {
		const { forceReconnect, keyringConnections } = this.props;
		const connectionStatus = this.getConnectionStatus();

		// Depending on current status, perform an action when user clicks the
		// service action button
		if ( 'connected' === connectionStatus && ! forceReconnect ) {
			this.props.onConnect( last( keyringConnections ) );
		} else {
			this.addConnection();
		}
	};

	/**
	 * Establishes a new connection.
	 */
	addConnection = () => {
		this.setState( { isConnecting: true } );
		if ( this.props.service ) {
			// Attempt to create a new connection. If a Keyring connection ID
			// is not provided, the user will need to authorize the app
			requestExternalAccess( this.props.service.connect_URL, keyringId => {
				// When the user has finished authorizing the connection
				// (or otherwise closed the window), force a refresh
				this.props.requestKeyringConnections( true );

				// In the case that a Keyring connection doesn't exist, wait for app
				// authorization to occur, then display with the available connections
				this.setState( { isAwaitingConnections: true, keyringId } );
			} );
		} else {
			this.setState( { isConnecting: false } );
		}
	};

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props.keyringConnections, nextProps.keyringConnections ) ) {
			this.setState( {
				isConnecting: false,
			} );
		}

		if ( ! this.state.isAwaitingConnections ) {
			return;
		}

		this.setState( {
			isAwaitingConnections: false,
			isRefreshing: false,
		} );

		if ( this.didKeyringConnectionSucceed( nextProps.keyringConnections ) ) {
			const keyringId = this.state.keyringId || null;
			this.setState( { isConnecting: false, keyringId: null } );
			let newKeyringConnection = null;
			if ( keyringId ) {
				newKeyringConnection = find( nextProps.keyringConnections, { ID: keyringId } );
			} else {
				// if no keyring id is given from the popup,
				// fallback to less reliable ways of determining the new connection
				newKeyringConnection =
					differenceBy( this.props.keyringConnections, nextProps.keyringConnections, 'ID' )[ 0 ] ||
					last( nextProps.keyringConnections );
			}

			this.props.onConnect( newKeyringConnection );
		}
	}

	/**
	 * Returns whether the Keyring authorization attempt succeeded
	 * in creating new Keyring account options.
	 *
	 * @param {Array} keyringConnections props to check on if a keyring connection succeeded.
	 * @return {Boolean} Whether the Keyring authorization attempt succeeded
	 */
	didKeyringConnectionSucceed( keyringConnections ) {
		const hasAnyConnectionOptions = some(
			keyringConnections,
			keyringConnection =>
				keyringConnection.isConnected === false || keyringConnection.isConnected === undefined
		);

		if ( keyringConnections.length === 0 ) {
			this.setState( { isConnecting: false } );
		} else if ( ! hasAnyConnectionOptions ) {
			this.setState( { isConnecting: false } );
		}

		return keyringConnections.length && hasAnyConnectionOptions;
	}

	render() {
		const { primary, service, translate } = this.props;
		const { isConnecting, isRefreshing } = this.state;
		const status = service ? this.getConnectionStatus() : 'unknown';
		let localPrimary = false,
			warning = false,
			label;

		const isPending = 'unknown' === status || isRefreshing || isConnecting;

		if ( 'unknown' === status ) {
			label = translate( 'Loading…' );
		} else if ( isRefreshing ) {
			label = translate( 'Reconnecting…' );
			warning = true;
		} else if ( isConnecting ) {
			label = translate( 'Connecting…' );
		} else {
			label = this.props.children;
			localPrimary = primary;
		}

		return (
			<Fragment>
				<QueryKeyringServices />
				<Button
					primary={ localPrimary }
					scary={ warning }
					onClick={ this.onClick }
					disabled={ isPending }
				>
					{ label }
				</Button>
			</Fragment>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const service = getKeyringServiceByName( state, ownProps.serviceId );
		const keyringConnections = service ? getKeyringConnectionsByName( state, service.ID ) : [];
		const isFetching = isKeyringConnectionsFetching( state );

		return {
			service,
			isFetching,
			keyringConnections,
		};
	},
	{
		deleteStoredKeyringConnection,
		requestKeyringConnections,
	}
)( localize( KeyringConnectButton ) );
