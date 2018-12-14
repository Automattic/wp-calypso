/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { getRemovableConnections } from 'state/sharing/publicize/selectors';

const SharingServiceAction = ( {
	isConnecting,
	isDisconnecting,
	isRefreshing,
	onAction,
	removableConnections,
	service,
	status,
	translate,
} ) => {
	let primary = false,
		warning = false,
		label;

	const isPending = 'unknown' === status || isDisconnecting || isRefreshing || isConnecting;
	const onClick = event => {
		event.stopPropagation();
		onAction();
	};

	if ( 'unknown' === status ) {
		label = translate( 'Loading…', { context: 'Sharing: Publicize status pending button label' } );
	} else if ( isDisconnecting ) {
		label = translate( 'Disconnecting…', {
			context: 'Sharing: Publicize disconnect pending button label',
		} );
	} else if ( isRefreshing ) {
		label = translate( 'Reconnecting…', {
			context: 'Sharing: Publicize reconnect pending button label',
		} );
		warning = true;
	} else if ( isConnecting ) {
		label = translate( 'Connecting…', {
			context: 'Sharing: Publicize connect pending button label',
		} );
	} else if ( 'connected' === status || 'must-disconnect' === status ) {
		if ( removableConnections.length > 1 ) {
			label = translate( 'Disconnect All', {
				context: 'Sharing: Publicize disconnect button label',
			} );
		} else {
			label = translate( 'Disconnect', { context: 'Sharing: Publicize disconnect button label' } );
		}
		if ( 'must-disconnect' === status ) {
			warning = true;
		}
	} else if ( 'reconnect' === status ) {
		label = translate( 'Reconnect', {
			context: 'Sharing: Publicize reconnect pending button label',
		} );
		warning = true;
	} else {
		label = translate( 'Connect', { context: 'Sharing: Publicize connect pending button label' } );
		primary = true;
	}

	if ( 'google_plus' === service.ID && 1 > removableConnections.length ) {
		return (
			<Button compact disabled={ true }>
				Unavailable
			</Button>
		);
	}

	return (
		<Button
			primary={ primary }
			scary={ warning }
			compact
			onClick={ onClick }
			disabled={ isPending }
		>
			{ label }
		</Button>
	);
};

SharingServiceAction.propTypes = {
	isConnecting: PropTypes.bool,
	isDisconnecting: PropTypes.bool,
	isRefreshing: PropTypes.bool,
	onAction: PropTypes.func,
	removableConnections: PropTypes.arrayOf( PropTypes.object ),
	service: PropTypes.object.isRequired,
	status: PropTypes.string,
	translate: PropTypes.func,
};

SharingServiceAction.defaultProps = {
	isConnecting: false,
	isDisconnecting: false,
	isRefreshing: false,
	onAction: () => {},
	removableConnections: [],
	status: 'unknown',
	translate: identity,
};

export default connect( ( state, { service } ) => ( {
	removableConnections: getRemovableConnections( state, service.ID ),
} ) )( localize( SharingServiceAction ) );
