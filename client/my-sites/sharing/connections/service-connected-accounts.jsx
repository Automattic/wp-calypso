/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Connection from './connection';
import { recordGoogleEvent } from 'state/analytics/actions';

class SharingServiceConnectedAccounts extends Component {
	static propTypes = {
		connections: PropTypes.array,               // Set of connections for the service
		isDisconnecting: PropTypes.bool,            // Whether a disconnect request is pending
		isRefreshing: PropTypes.bool,               // Whether a connection refresh is pending
		onAddConnection: PropTypes.func,            // Handler to invoke when adding a new connection
		onRefreshConnection: PropTypes.func,        // Handler to invoke when refreshing a connection
		onRemoveConnection: PropTypes.func,         // Handler to invoke when removing an existing connection
		onToggleSitewideConnection: PropTypes.func, // Handler to invoke when toggling a connection to be shared sitewide
		recordGoogleEvent: PropTypes.func,          // Redux action to track an event
		service: PropTypes.object.isRequired,       // The service object
		translate: PropTypes.func,
	};

	static defaultProps = {
		connections: Object.freeze( [] ),
		isDisconnecting: false,
		isRefreshing: false,
		onAddConnection: () => {},
		onRefreshConnection: () => {},
		onRemoveConnection: () => {},
		onToggleSitewideConnection: () => {},
		translate: identity,
	};

	connectAnother = () => {
		this.props.onAddConnection();
		this.props.recordGoogleEvent( 'Sharing', 'Clicked Connect Another Account Button', this.props.service.ID );
	};

	getConnectionElements() {
		return this.props.connections.map( ( connection ) =>
			<Connection
				key={ connection.keyring_connection_ID }
				connection={ connection }
				isDisconnecting={ this.props.isDisconnecting }
				isRefreshing={ this.props.isRefreshing }
				onDisconnect={ this.props.onRemoveConnection }
				onRefresh={ this.props.onRefreshConnection }
				onToggleSitewideConnection={ this.props.onToggleSitewideConnection }
				service={ this.props.service }
				showDisconnect={ this.props.connections.length > 1 || 'broken' === connection.status } />
		);
	}

	getConnectAnotherElement() {
		if ( 'publicize' === this.props.service.type ) {
			return (
				<a onClick={ this.connectAnother } className="button new-account">
					{ this.props.translate( 'Connect a different account', { comment: 'Sharing: Publicize connections' } ) }
				</a>
			);
		}
	}

	render() {
		return (
			<div className="sharing-service-accounts-detail">
				<ul className="sharing-service-connected-accounts">
					{ this.getConnectionElements() }
				</ul>
				{ this.getConnectAnotherElement() }
			</div>
		);
	}
}

export default connect(
	null,
	{
		recordGoogleEvent,
	},
)( localize( SharingServiceConnectedAccounts ) );
