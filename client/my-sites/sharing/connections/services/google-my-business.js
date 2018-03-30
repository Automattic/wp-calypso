/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { filter, last, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { deleteStoredKeyringConnection } from 'state/sharing/keyring/actions';
import GoogleMyBusinessLogo from 'my-sites/google-my-business/logo';
import { SharingService, connectFor } from 'my-sites/sharing/connections/service';
import { requestSiteSettings, saveSiteSettings } from 'state/site-settings/actions';
import { getSiteSettings, isRequestingSiteSettings } from 'state/site-settings/selectors';

export class GoogleMyBusiness extends SharingService {
	static propTypes = {
		...SharingService.propTypes,
		saveSiteSettings: PropTypes.func,
		saveRequests: PropTypes.object,
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
		this.props.saveSiteSettings( this.props.siteId, { gmb_api_token: null } );
		// TODO: only delete if this is the last site that uses this keyring connection
		this.props.deleteStoredKeyringConnection( last( this.getConnections() ) );
	};

	componentWillMount() {
		this.requestSettings( this.props );
	}

	requestSettings( props ) {
		const { requestingSiteSettings, siteId } = props;
		if ( ! requestingSiteSettings && siteId ) {
			props.requestSiteSettings( siteId );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId && this.props.siteId !== nextProps.siteId ) {
			this.requestSettings( nextProps );
		}

		if ( ! isEqual( this.props.availableExternalAccounts, nextProps.availableExternalAccounts ) ) {
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

		if ( this.didKeyringConnectionSucceed( nextProps.availableExternalAccounts ) ) {
			const savingSiteSettings =
				nextProps.saveRequests[ this.props.siteId ] &&
				nextProps.saveRequests[ this.props.siteId ].saving;

			if ( ! savingSiteSettings ) {
				this.props.saveSiteSettings( this.props.siteId, {
					gmb_api_token: last( nextProps.availableExternalAccounts ).keyringConnectionId,
				} );
			}

			this.setState( { isConnecting: false } );
			this.props.successNotice(
				this.props.translate( 'The %(service)s account was successfully connected.', {
					args: { service: this.props.service.label },
					context: 'Sharing: Publicize connection confirmation',
				} )
			);
		}
	}

	renderLogo() {
		// Render a custom logo here because Google My Business is not part of SocialLogos
		return (
			<GoogleMyBusinessLogo
				className="sharing-service__logo"
				height="36"
				style={ { padding: 6 + 'px' } }
				width="36"
			/>
		);
	}
}

const getSiteKeyringConnections = ( service, connections, siteSettings ) => {
	if ( ! service || ! siteSettings || ! siteSettings.gmb_api_token ) {
		return [];
	}

	connections = connections.map( connection => ( {
		...connection,
		keyring_connection_ID: connection.ID,
	} ) );

	return filter( connections, {
		service: service.ID,
		keyring_connection_ID: siteSettings.gmb_api_token,
	} );
};

export default connectFor(
	GoogleMyBusiness,
	( state, props ) => {
		const siteSettings = getSiteSettings( state, props.siteId );
		return {
			...props,
			requestingSiteSettings: isRequestingSiteSettings( state, props.siteId ),
			saveRequests: state.siteSettings.saveRequests,
			removableConnections: props.keyringConnections,
			fetchConnection: props.requestKeyringConnections,
			siteUserConnections: getSiteKeyringConnections(
				props.service,
				props.keyringConnections,
				siteSettings
			),
		};
	},
	{
		deleteStoredKeyringConnection,
		requestSiteSettings,
		saveSiteSettings,
	}
);
