/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { SharingService, connectFor } from 'my-sites/marketing/connections/service';
import { deleteSiteKeyring } from 'state/site-keyrings/actions';

export class GoogleDrive extends SharingService {
	static propTypes = {
		...SharingService.propTypes,
		deleteSiteKeyring: PropTypes.func,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		deleteSiteKeyring: () => {},
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
		const keyringId = this.props.siteUserConnections[ 0 ].ID;
		this.props.deleteSiteKeyring( this.props.siteId, keyringId );
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
		// Render a custom logo here because Google Drive is not part of SocialLogos
		return (
			<img
				className="services__logo"
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
		deleteSiteKeyring,
	}
);
