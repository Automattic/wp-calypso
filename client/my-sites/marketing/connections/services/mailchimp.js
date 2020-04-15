/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { last, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { deleteStoredKeyringConnection } from 'state/sharing/keyring/actions';
import { SharingService, connectFor } from 'my-sites/marketing/connections/service';

export class Mailchimp extends SharingService {
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
	 * @param {Array} connections Optional. Connections to be deleted.
	 *                            Default: All connections for this service.
	 */
	removeConnection = () => {
		this.setState( { isDisconnecting: true } );
		this.props.deleteStoredKeyringConnection( last( this.props.keyringConnections ) );
	};

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
	Mailchimp,
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
