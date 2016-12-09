/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class SharingServiceAction extends Component {
	static propTypes = {
		connections: PropTypes.array,
		isConnecting: PropTypes.bool,
		isDisconnecting: PropTypes.bool,
		isRefreshing: PropTypes.bool,
		onAction: PropTypes.func,
		removableConnections: PropTypes.array,
		service: PropTypes.object.isRequired,
		status: PropTypes.string,
		translate: PropTypes.func,
	};

	static defaultProps = {
		connections: Object.freeze( [] ),
		isConnecting: false,
		isDisconnecting: false,
		isRefreshing: false,
		onAction: () => {},
		removableConnections: Object.freeze( [] ),
		status: 'unknown',
		translate: identity,
	};

	onActionClick = ( event ) => {
		event.stopPropagation();
		this.props.onAction();
	};

	render() {
		let primary = false,
			warning = false,
			label;

		const { translate } = this.props,
			isPending = 'unknown' === this.props.status || this.props.isDisconnecting ||
				this.props.isRefreshing || this.props.isConnecting;

		if ( 'unknown' === this.props.status ) {
			label = translate( 'Loading…', { context: 'Sharing: Publicize status pending button label' } );
		} else if ( this.props.isDisconnecting ) {
			label = translate( 'Disconnecting…', { context: 'Sharing: Publicize disconnect pending button label' } );
		} else if ( this.props.isRefreshing ) {
			label = translate( 'Reconnecting…', { context: 'Sharing: Publicize reconnect pending button label' } );
			warning = true;
		} else if ( this.props.isConnecting ) {
			label = translate( 'Connecting…', { context: 'Sharing: Publicize connect pending button label' } );
		} else if ( 'connected' === this.props.status ) {
			if ( this.props.removableConnections.length > 1 ) {
				label = translate( 'Disconnect All', { context: 'Sharing: Publicize disconnect button label' } );
			} else {
				label = translate( 'Disconnect', { context: 'Sharing: Publicize disconnect button label' } );
			}
		} else if ( 'reconnect' === this.props.status ) {
			label = translate( 'Reconnect', { context: 'Sharing: Publicize reconnect pending button label' } );
			warning = true;
		} else {
			label = translate( 'Connect', { context: 'Sharing: Publicize connect pending button label' } );
			primary = true;
		}

		return (
			<Button
				primary={ primary }
				scary={ warning }
				compact
				onClick={ this.onActionClick }
				disabled={ isPending }>
				{ label }
			</Button>
		);
	}
}

export default localize( SharingServiceAction );
