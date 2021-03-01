/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { isEqual, map } from 'lodash';

/**
 * Internal dependencies
 */
import { deleteStoredKeyringConnection } from 'calypso/state/sharing/keyring/actions';
import { SharingService, connectFor } from 'calypso/my-sites/marketing/connections/service';
import SocialLogo from 'calypso/components/social-logo';

export class Instagram extends SharingService {
	static propTypes = {
		// This foreign propTypes access should be safe because we expect all of them to be removed
		// eslint-disable-next-line react/forbid-foreign-prop-types
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
	 * @param {Array} [connections] List of connections to delete. If undefined, delete all connections.
	 */
	removeConnection = ( connections ) => {
		this.setState( { isDisconnecting: true } );
		map( connections || this.props.keyringConnections, this.props.deleteStoredKeyringConnection );
	};

	renderLogo = () => (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<SocialLogo icon="instagram" size={ 48 } className="sharing-service__logo" />
	);

	UNSAFE_componentWillReceiveProps( { availableExternalAccounts } ) {
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
}

export default connectFor(
	Instagram,
	( state, props ) => {
		return {
			...props,
			removableConnections: props.keyringConnections,
			fetchConnection: props.requestKeyringConnections,
			siteUserConnections: props.keyringConnections.map( ( conn ) => ( {
				...conn,
				keyring_connection_ID: conn.ID,
			} ) ),
		};
	},
	{
		deleteStoredKeyringConnection,
	}
);
