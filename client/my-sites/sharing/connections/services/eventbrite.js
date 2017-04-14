/**
 * External dependencies
 */
import { PropTypes } from 'react';
import { last, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { SharingService, connectFor } from 'my-sites/sharing/connections/service';
import { deleteKeyringConnection } from 'state/sharing/keyring/actions';
import { saveSiteSettings } from 'state/site-settings/actions';

export class Eventbrite extends SharingService {
	static propTypes = {
		...SharingService.propTypes,
		saveRequests: PropTypes.object,
		saveSiteSettings: PropTypes.func,
		deleteKeyringConnection: PropTypes.func,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		saveRequests: {},
		saveSiteSettings: () => {},
		deleteKeyringConnection: () => {},
	};

	createOrUpdateConnection = () => { };

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
}

export default connectFor(
	Eventbrite,
	( state, props ) => {
		return {
			...props,
			saveRequests: state.siteSettings.saveRequests,
			removableConnections: props.keyringConnections,
			fetchConnection: props.requestKeyringConnections,
			siteUserConnections: props.keyringConnections.map( conn => ( { ...conn, keyring_connection_ID: conn.ID } ) ),
		};
	},
	{
		saveSiteSettings,
		deleteKeyringConnection,
	}
);
