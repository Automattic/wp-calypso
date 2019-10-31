/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { last, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { deleteStoredKeyringConnection } from 'state/sharing/keyring/actions';
import { SharingService, connectFor } from 'my-sites/marketing/connections/service';

export class GoogleDrive extends SharingService {
	static propTypes = {
		...SharingService.propTypes,
		deleteStoredKeyringConnection: PropTypes.func,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		deleteStoredKeyringConnection: () => {},
	};

	createOrUpdateConnection = () => {};

	/**
	 * Deletes the passed connections.
	 *
	 * @param {Array} connections Optional. Connections to be deleted.
	 *                            Default: All connections for this service.
	 */
	removeConnection = () => {
		this.setState( { isDisconnecting: true } );
		this.props.deleteStoredKeyringConnection( last( this.props.keyringConnections ) );
	};

	componentWillReceiveProps( { availableExternalAccounts } ) {
		if ( ! isEqual( this.props.availableExternalAccounts, availableExternalAccounts ) ) {
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

		if ( this.didKeyringConnectionSucceed( availableExternalAccounts ) ) {
			this.setState( { isConnecting: false } );
			this.props.successNotice(
				this.props.translate( 'The %(service)s account was successfully connected.', {
					args: { service: this.props.service.label },
					context: 'Sharing: Publicize connection confirmation',
				} ),
				{ id: 'publicize' }
			);
		}
	}

	/*
	 * We render a custom logo here instead of using SocialLogos as we need a full colour logo and SocialLogos currently strips all colour
	 * When SocialLogos supports colour logos then we can remove this and use the default renderLogo() in SharingService
	 */
	renderLogo() {
		// Render a custom logo here because Google My Business is not part of SocialLogos
		return (
			<img
				className="sharing-service__logo"
				src="/calypso/images/sharing/google-drive-logo.svg"
				width="36"
				height="36"
				alt=""
				style={ { padding: 6 + 'px' } }
			/>
		);
	}
}

export default connectFor(
	GoogleDrive,
	( state, props ) => {
		return {
			...props,
			removableConnections: props.keyringConnections,
			fetchConnection: props.requestKeyringConnections,
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
