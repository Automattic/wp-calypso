/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { last, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { SharingService, connectFor } from 'my-sites/marketing/connections/service';
import { deleteStoredKeyringConnection } from 'state/sharing/keyring/actions';
import { saveSiteSettings } from 'state/site-settings/actions';

export class Eventbrite extends SharingService {
	static propTypes = {
		// This foreign propTypes access should be safe because we expect all of them to be removed
		// eslint-disable-next-line react/forbid-foreign-prop-types
		...SharingService.propTypes,
		saveRequests: PropTypes.object,
		saveSiteSettings: PropTypes.func,
		deleteStoredKeyringConnection: PropTypes.func,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		saveRequests: {},
		saveSiteSettings: () => {},
		deleteStoredKeyringConnection: () => {},
	};

	createOrUpdateConnection = () => {};

	/**
	 * Deletes the Keyring connection from our database and removes any stored token in site options.
	 */
	removeConnection = () => {
		this.setState( { isDisconnecting: true } );
		this.props.saveSiteSettings( this.props.siteId, { eventbrite_api_token: null } );
		this.props.deleteStoredKeyringConnection( last( this.props.keyringConnections ) );
	};

	UNSAFE_componentWillReceiveProps( { availableExternalAccounts, saveRequests } ) {
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
			const savingSiteSettings =
				saveRequests[ this.props.siteId ] && saveRequests[ this.props.siteId ].saving;

			if ( ! savingSiteSettings ) {
				this.props.saveSiteSettings( this.props.siteId, {
					eventbrite_api_token: last( availableExternalAccounts ).keyringConnectionId,
				} );
			}

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
	Eventbrite,
	( state, props ) => {
		return {
			...props,
			saveRequests: state.siteSettings.saveRequests,
			removableConnections: props.keyringConnections,
			fetchConnection: props.requestKeyringConnections,
			siteUserConnections: props.keyringConnections.map( conn => ( {
				...conn,
				keyring_connection_ID: conn.ID,
			} ) ),
		};
	},
	{
		saveSiteSettings,
		deleteStoredKeyringConnection,
	}
);
