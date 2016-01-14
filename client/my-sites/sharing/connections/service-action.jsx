/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import serviceConnections from './service-connections';
import Button from 'components/button';

module.exports = React.createClass( {
	displayName: 'SharingServiceAction',

	propTypes: {
		status: React.PropTypes.string,
		service: React.PropTypes.object.isRequired,
		onAction: React.PropTypes.func,
		connections: React.PropTypes.array,
		isDisconnecting: React.PropTypes.bool,
		isRefreshing: React.PropTypes.bool,
		isConnecting: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			status: 'unknown',
			onAction: function() {},
			connections: Object.freeze( [] ),
			isDisconnecting: false,
			isRefreshing: false,
			isConnecting: false
		};
	},

	onActionClick: function( event ) {
		event.stopPropagation();
		this.props.onAction();
	},

	render: function() {
		let primary = false,
			borderless = false,
			warning = false,
			isPending, removableConnections, label;

		isPending = 'unknown' === this.props.status || this.props.isDisconnecting ||
			this.props.isRefreshing || this.props.isConnecting;

		if ( 'connected' === this.props.status ) {
			removableConnections = serviceConnections.getRemovableConnections( this.props.service.name );
		}

		if ( 'unknown' === this.props.status ) {
			label = this.translate( 'Loading…', { context: 'Sharing: Publicize status pending button label' } );
		} else if ( this.props.isDisconnecting ) {
			label = this.translate( 'Disconnecting…', { context: 'Sharing: Publicize disconnect pending button label' } );
		} else if ( this.props.isRefreshing ) {
			label = this.translate( 'Reconnecting…', { context: 'Sharing: Publicize reconnect pending button label' } );
			warning = true;
		} else if ( this.props.isConnecting ) {
			label = this.translate( 'Connecting…', { context: 'Sharing: Publicize connect pending button label' } );
		} else if ( 'connected' === this.props.status && removableConnections.length ) {
			if ( removableConnections.length > 1 ) {
				label = this.translate( 'Disconnect All', { context: 'Sharing: Publicize disconnect button label' } );
			} else {
				label = this.translate( 'Disconnect', { context: 'Sharing: Publicize disconnect button label' } );
			}
		} else if ( 'reconnect' === this.props.status ) {
			label = this.translate( 'Reconnect', { context: 'Sharing: Publicize reconnect pending button label' } );
			warning = true;
		} else {
			label = this.translate( 'Connect', { context: 'Sharing: Publicize connect pending button label' } );
			primary = true;
		}

		return (
			<Button
				primary={ primary }
				borderless={ borderless }
				scary={ warning }
				compact
				onClick={ this.onActionClick }
				disabled={ isPending }>
				{ label }
			</Button>
		);
	}
} );
