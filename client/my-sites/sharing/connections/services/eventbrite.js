/**
 * External dependencies
 */
import { PropTypes } from 'react';
import { last, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { SharingService, connectFor } from '../service';
import { deleteKeyringConnection } from 'state/sharing/keyring/actions';
import { saveSiteSettings } from 'state/site-settings/actions';

export class Eventbrite extends SharingService {
	static propTypes = {
		...SharingService.propTypes,
		saveSiteSettings: PropTypes.func,
		deleteKeyringConnection: PropTypes.func,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		saveSiteSettings: () => {},
		deleteKeyringConnection: () => {},
	};

	createOrUpdateConnection = () => { };

	/**
	 * Fetch connections
	 */
	fetchConnection = () => {
		this.props.requestKeyringConnections();
	};

	/**
	 * Checks whether any connection can be removed.
	 *
	 * @return {boolean} true if there's any removable; otherwise, false.
	 */
	canRemoveConnection = () => {
		return this.props.keyringConnections.length > 0;
	};

	/**
	 * Deletes the passed connections.
	 *
	 * @param {Array} connections Optional. Connections to be deleted.
	 *                            Default: All connections for this service.
	 */
	removeConnection = () => {
		this.setState( { isDisconnecting: true } );
		this.props.saveSiteSettings( this.props.siteId, { eventbrite_api_token: null } );
		this.props.deleteKeyringConnection( last( this.props.keyringConnections ) );
	};

	componentWillReceiveProps( { availableExternalAccounts, saveRequests } ) {
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
			const savingSiteSettings = saveRequests[ this.props.siteId ] && saveRequests[ this.props.siteId ].saving;

			if ( ! savingSiteSettings ) {
				this.props.saveSiteSettings(
					this.props.siteId,
					{ eventbrite_api_token: last( availableExternalAccounts ).keyringConnectionId }
				);
			}

			this.setState( { isConnecting: false } );
			this.props.successNotice( this.props.translate( 'The %(service)s account was successfully connected.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize connection confirmation',
			} ), { id: 'publicize' } );
		}
	}

	/**
	 * Get connections to render
	 *
	 * @return {array} connections.
	 */
	getConnections() {
		return this.props.keyringConnections.map( connection => {
			return { ...connection, keyring_connection_ID: connection.ID };
		} );
	}
}

export default connectFor(
	Evenrbrite,
	( state ) => {
		return { saveRequests: state.siteSettings.saveRequests };
	},
	{
		saveSiteSettings,
		deleteKeyringConnection,
	}
);
