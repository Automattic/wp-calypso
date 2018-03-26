/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { last, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { deleteStoredKeyringConnection } from 'state/sharing/keyring/actions';
import { SharingService, connectFor } from 'my-sites/sharing/connections/service';
import { getKeyringServiceByName } from 'state/sharing/services/selectors';
import QueryKeyringServices from 'components/data/query-keyring-services';

class GoogleMyBusinessConnectButton extends SharingService {
	static propTypes = {
		...SharingService.propTypes,
		deleteStoredKeyringConnection: PropTypes.func,
		onClick: PropTypes.func,
		onConnect: PropTypes.func,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		deleteStoredKeyringConnection: () => {},
		onClick: () => {},
		onConnect: () => {},
	};

	// override `createOrUpdateConnection` to ignore connection update, this is only useful for publicize services
	createOrUpdateConnection = () => {};

	// override `removeConnection` to remove the keyring connection instead of the publicize one
	removeConnection = () => {
		this.setState( { isDisconnecting: true } );
		this.props.deleteStoredKeyringConnection( last( this.props.keyringConnections ) );
	};

	onClick = () => {
		this.performAction();
		this.props.onClick();
	};

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props.availableExternalAccounts, nextProps.availableExternalAccounts ) ) {
			this.setState( {
				isConnecting: false,
				isDisconnecting: false,
			} );
		}

		if ( ! this.state.isAwaitingConnections ) {
			return;
		}

		this.setState( {
			isAwaitingConnections: false,
			isRefreshing: false,
		} );

		if ( this.didKeyringConnectionSucceed( nextProps.availableExternalAccounts ) ) {
			this.setState( { isConnecting: false } );
			this.props.onConnect();
		}
	}

	render() {
		const { service, translate } = this.props;
		const { isConnecting, isRefreshing, isDisconnecting } = this.state;
		const status = this.getConnectionStatus( service.ID );
		let primary = false,
			warning = false,
			label;

		const isPending = 'unknown' === status || isDisconnecting || isRefreshing || isConnecting;

		if ( 'unknown' === status ) {
			label = translate( 'Loading…' );
		} else if ( isDisconnecting ) {
			label = translate( 'Disconnecting…' );
		} else if ( isRefreshing ) {
			label = translate( 'Reconnecting…' );
			warning = true;
		} else if ( isConnecting ) {
			label = translate( 'Connecting…' );
		} else if ( 'connected' === status ) {
			label = translate( 'Disconnect' );
		} else {
			label = this.props.children;
			primary = true;
		}

		return (
			<Button primary={ primary } scary={ warning } onClick={ this.onClick } disabled={ isPending }>
				{ label }
			</Button>
		);
	}
}

// `connectFor` HOC requires the `service` props to be passed
// Therefore we need to wrap the resulting component into a parent component
const GoogleMyBusinessConnectButtonConnected = connectFor(
	GoogleMyBusinessConnectButton,
	( state, props ) => {
		return {
			...props,
			removableConnections: props.keyringConnections,
			fetchConnection: props.requestKeyringConnections,
			service: getKeyringServiceByName( state, 'google_my_business' ),
			siteUserConnections: props.keyringConnections.map( connection => ( {
				...connection,
				keyring_connection_ID: connection.ID,
			} ) ),
		};
	},
	{
		deleteStoredKeyringConnection,
	}
);

export default connect( state => ( {
	service: getKeyringServiceByName( state, 'google_my_business' ),
} ) )( props => (
	<div>
		<QueryKeyringServices />
		{ props.service && <GoogleMyBusinessConnectButtonConnected { ...props } /> }
		{ ! props.service && <Button disabled={ true }>{ props.children }</Button> }
	</div>
) );
