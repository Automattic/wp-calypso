/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { last, isEqual, memoize } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { deleteStoredKeyringConnection } from 'state/sharing/keyring/actions';
import { SharingService, connectFor } from 'my-sites/sharing/connections/service';

export class GoogleMyBusiness extends SharingService {
	static propTypes = {
		...SharingService.propTypes,
		deleteStoredKeyringConnection: PropTypes.func,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		deleteStoredKeyringConnection: () => {},
	};

	// override `createOrUpdateConnection` to ignore connection update, this is only useful for publicize services
	createOrUpdateConnection = () => {};

	// override `removeConnection` to remove the keyring connection instead of the publicize one
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

	renderLogo() {
		// Render a custom logo here because Google My Business is not part of SocialLogos
		return (
			<img
				alt={ translate( 'Google My Business logo' ) }
				className="sharing-service__logo"
				height="36"
				src={ '/calypso/images/google-my-business/logo.svg' }
				style={ { padding: 6 + 'px' } }
				width="36"
			/>
		);
	}
}

const addKeyringConnectionIdToConnections = memoize( connections =>
	connections.map( connection => ( {
		...connection,
		keyring_connection_ID: connection.ID,
	} ) )
);

export default connectFor(
	GoogleMyBusiness,
	( state, props ) => {
		return {
			...props,
			removableConnections: props.keyringConnections,
			fetchConnection: props.requestKeyringConnections,
			siteUserConnections: addKeyringConnectionIdToConnections( props.keyringConnections ),
		};
	},
	{
		deleteStoredKeyringConnection,
	}
);
